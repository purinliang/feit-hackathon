#!/usr/bin/env python3
"""
CV (PDF) → Job Recommendations Agent

What it does
------------
1) Extract text from a PDF resume/CV
2) Structure the candidate profile with an LLM
3) Generate search queries
4) Search the web for recent job postings (Tavily)
5) Summarize & score fit for each posting
6) Output top-N recommendations as JSON and a Markdown table

Usage
-----
python cv_pdf_to_job_recs_agent.py ./my_cv.pdf --location "Shanghai OR Remote" --top_k 8

Requirements
------------
- Python 3.10+
- pip install:
  langchain>=0.2 langchain-openai>=0.1 pydantic tiktoken pypdf tavily-python

Environment
-----------
export OPENAI_API_KEY=...
export TAVILY_API_KEY=...

Notes
-----
- Tavily is a general web search API; for production, you may integrate LinkedIn/Indeed APIs or your own scraper.
- The LLM model and prompts are configured for Chinese outputs.
"""

from __future__ import annotations
import argparse
import json
import os
from dataclasses import dataclass
from typing import List, Optional

from pypdf import PdfReader
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, SystemMessage

from tavily import TavilyClient

# -----------------------------
# Pydantic Schemas
# -----------------------------

class UserProfile(BaseModel):
    name: Optional[str] = None
    years_exp: Optional[int] = None
    current_title: Optional[str] = None
    education: Optional[str] = None
    skills: List[str] = []
    domains: List[str] = []  # 行业/领域
    certifications: List[str] = []
    languages: List[str] = []
    preferences: List[str] = []  # 远程/出差/规模等

class JobPreference(BaseModel):
    target_roles: List[str] = []
    location: Optional[str] = None
    constraints: List[str] = []   # 薪资/签证/时间等（可为空）

class JobPosting(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None
    requirements: List[str] = []
    keywords: List[str] = []
    fit_score: Optional[float] = None  # 0~1

# -----------------------------
# Utilities
# -----------------------------

def read_pdf_text(path: str) -> str:
    reader = PdfReader(path)
    texts = []
    for page in reader.pages:
        try:
            texts.append(page.extract_text() or "")
        except Exception:
            pass
    return "\n".join(texts)

# -----------------------------
# LLM Setup
# -----------------------------

def get_llm() -> ChatOpenAI:
    return ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0.2)

# Profile extraction prompt → structured JSON
profile_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是资深职业教练，擅长从中文或英文简历中提炼结构化画像。只用简体中文回答。"),
    ("human", (
        "从以下简历文本抽取候选人的标准画像。若缺失的字段留空。\n"
        "简历文本：\n{cv}\n\n"
        "仅返回JSON，键严格使用：name, years_exp, current_title, education, skills, domains, certifications, languages, preferences。"
    )),
])

# Query generation
query_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是招聘搜索专家。"),
    ("human", (
        "候选人画像：{profile}\n期望：{pref}\n"
        "请生成3-6条高质量搜索查询，面向近期招聘信息。\n"
        "要求：中文或英文组合，包含岗位、必备技能、行业/领域、地点或远程关键词，避免过度宽泛。只返回一行一个查询字符串的列表(JSON数组)。"
    )),
])

# Summarize a single search result into JobPosting
summ_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是HR顾问，能从网页片段中提炼职位要点并评估匹配度。"),
    ("human", (
        "候选人画像：{profile}\n\n网页片段：\n{snippet}\n\n"
        "请抽取并返回JSON (title, company, location, url, summary, requirements, keywords)；"
        "若非招聘信息或信息严重不足则返回空对象{{}}。"
    )),
])

# Scoring
score_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是匹配度评估器，返回0~1的小数，保留两位。"),
    ("human", (
        "候选人画像：{profile}\n职位：{job}\n"
        "请基于技能/年限/领域/偏好，给出匹配度分数(0~1)，只返回数字。"
    )),
])

# -----------------------------
# Core Pipeline
# -----------------------------

def extract_profile(cv_text: str) -> UserProfile:
    llm = get_llm()
    prof = llm.with_structured_output(UserProfile).invoke(profile_prompt.format_messages(cv=cv_text))
    return prof

def gen_queries(profile: UserProfile, pref: JobPreference) -> List[str]:
    llm = get_llm()
    text = llm.invoke(query_prompt.format_messages(profile=profile.model_dump(), pref=pref.model_dump()))
    try:
        return json.loads(text.content)
    except Exception:
        # 兜底：基于技能与角色拼接
        base = pref.target_roles or [profile.current_title or "工程师"]
        skills = ", ".join(profile.skills[:4])
        loc = pref.location or "Remote"
        return [f"{r} {skills} {loc} hiring requirements" for r in base]

@dataclass
class SearchHit:
    title: str
    url: str
    content: str


def search_jobs(queries: List[str], max_results: int = 5) -> List[SearchHit]:
    tv = TavilyClient()
    hits: List[SearchHit] = []
    for q in queries:
        res = tv.search(q, include_raw_content=True, max_results=max_results)
        for item in res.get("results", []):
            title = item.get("title", "")
            url = item.get("url", "")
            snippet = item.get("content", '') or item.get("raw_content", '')
            if url and snippet:
                hits.append(SearchHit(title=title, url=url, content=snippet[:5000]))
    return hits


def summarize_hit(profile: UserProfile, hit: SearchHit) -> Optional[JobPosting]:
    llm = get_llm()
    msg = llm.invoke(summ_prompt.format_messages(profile=profile.model_dump(), snippet=f"标题:{hit.title}\n链接:{hit.url}\n内容:{hit.content}"))
    try:
        data = json.loads(msg.content)
        if not data:
            return None
        # 填充URL
        if not data.get("url"):
            data["url"] = hit.url
        return JobPosting(**data)
    except Exception:
        return None


def score_fit(profile: UserProfile, job: JobPosting) -> float:
    llm = get_llm()
    s = llm.invoke(score_prompt.format_messages(profile=profile.model_dump(), job=job.model_dump()))
    try:
        return float(s.content.strip())
    except Exception:
        return 0.0


def recommend(cv_path: str, location: Optional[str], top_k: int = 8) -> List[JobPosting]:
    cv_text = read_pdf_text(cv_path)
    profile = extract_profile(cv_text)
    pref = JobPreference(location=location, target_roles=[], constraints=[],)

    # 若简历未明确目标，基于现有title/技能推断常见目标
    if not pref.target_roles:
        guess_prompt = ChatPromptTemplate.from_messages([
            ("system", "你是职业顾问。"),
            ("human", "画像：{profile}\n请给出3-5个适合的目标岗位（中文或英文），返回JSON数组。")
        ])
        llm = get_llm()
        try:
            roles = json.loads(llm.invoke(guess_prompt.format_messages(profile=profile.model_dump())).content)
            pref.target_roles = roles[:5]
        except Exception:
            pref.target_roles = [profile.current_title or "Software Engineer"]

    queries = gen_queries(profile, pref)
    hits = search_jobs(queries, max_results=5)

    # 去重（按URL）
    seen = set()
    uniq_hits: List[SearchHit] = []
    for h in hits:
        if h.url not in seen:
            uniq_hits.append(h); seen.add(h.url)

    # 总结并评分
    postings: List[JobPosting] = []
    for h in uniq_hits:
        jp = summarize_hit(profile, h)
        if jp:
            jp.fit_score = score_fit(profile, jp)
            postings.append(jp)

    # 排序并截取
    postings.sort(key=lambda x: (x.fit_score or 0.0), reverse=True)
    return postings[:top_k]

# -----------------------------
# CLI
# -----------------------------

def main():
    parser = argparse.ArgumentParser(description="CV PDF → Job Recommendations")
    parser.add_argument("cv_pdf", help="Path to CV PDF")
    parser.add_argument("--location", default=None, help="Location filter, e.g., 'Shanghai' or 'Remote' or 'Beijing OR Remote'")
    parser.add_argument("--top_k", type=int, default=8)
    args = parser.parse_args()

    results = recommend(args.cv_pdf, args.location, args.top_k)

    # Print JSON
    print(json.dumps([r.model_dump() for r in results], ensure_ascii=False, indent=2))

    # Also print a small Markdown table for readability
    def row(j: JobPosting) -> str:
        title = j.title.replace("|", "/")
        comp = (j.company or "").replace("|", "/")
        loc = (j.location or "")
        score = f"{j.fit_score:.2f}" if j.fit_score is not None else "-"
        url = j.url or ""
        return f"| {title} | {comp} | {loc} | {score} | {url} |"

    print("\n# 推荐职位 (Top-{} by fit)\n".format(args.top_k))
    print("| 职位 | 公司 | 地点 | 匹配度 | 链接 |")
    print("|---|---|---|---|---|")
    for j in results:
        print(row(j))

if __name__ == "__main__":
    main()
