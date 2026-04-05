r"""
insert_zilliz.py
================
CryptoRate Knowledge Base Ingestion Pipeline (Official SDK Edition)

This version uses the official Pymilvus MilvusClient directly for data ingestion,
which is the most reliable way to connect to Zilliz Cloud and avoids the
'should create connection first' error found in some LangChain integrations.
"""

import os
import pathlib
import time
from dotenv import load_dotenv

# -- Official Milvus SDK
from pymilvus import MilvusClient, DataType

# -- LangChain for processing
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.embeddings import DashScopeEmbeddings

# 1. Load Environment
load_dotenv()
ZILLIZ_URI     = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_TOKEN   = os.getenv("ZILLIZ_CLOUD_API_KEY")
DASHSCOPE_KEY  = os.getenv("DASHSCOPE_API_KEY")
COLLECTION_NAME = "crypto_knowledge"

if not all([ZILLIZ_URI, ZILLIZ_TOKEN, DASHSCOPE_KEY]):
    print("[!] Error: Missing environment variables in .env")
    exit(1)

print("=" * 60)
print("  [START] CryptoRate Knowledge Base Ingestion (Direct SDK)")
print("=" * 60)

# 2. Document Loading & Splitting
KNOWLEDGE_BASE_DIR = pathlib.Path(__file__).parent / "data" / "knowledge_base"
print(f"\n[1/4] Loading documents from: {KNOWLEDGE_BASE_DIR}")

loader = DirectoryLoader(
    path=str(KNOWLEDGE_BASE_DIR),
    glob="**/*.md",
    loader_cls=TextLoader,
    loader_kwargs={"encoding": "utf-8"},
    show_progress=True,
)
raw_docs = loader.load()
print(f"    [OK] Loaded {len(raw_docs)} files.")

print(f"\n[2/4] Splitting and cleaning data...")
markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "head1"), ("##", "head2"), ("###", "head3")]
)
recursive_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)

final_data = [] # List of dicts for MilvusClient
all_texts = []  # For batch embedding

for doc in raw_docs:
    header_splits = markdown_splitter.split_text(doc.page_content)
    for hsplit in header_splits:
        hsplit.metadata.update({"source": doc.metadata.get("source", "unknown")})
        chunks = recursive_splitter.split_documents([hsplit])
        for chunk in chunks:
            # Prepare clean metadata
            cleaned_meta = {}
            for k, v in chunk.metadata.items():
                safe_key = "".join(c for c in k if c.isalnum() or c == "_")
                if not safe_key or not safe_key[0].isalpha(): safe_key = "meta_" + safe_key
                cleaned_meta[safe_key] = str(v)
            
            all_texts.append(chunk.page_content)
            final_data.append({
                "text": chunk.page_content,
                "metadata": cleaned_meta # Store as a nested dict (enabled via dynamic fields)
            })

print(f"    [OK] Prepared {len(final_data)} chunks.")

# 3. Embedding Generation (DashScope)
print(f"\n[3/4] Generating Embeddings via DashScope (text-embedding-v1)...")
embeddings_model = DashScopeEmbeddings(dashscope_api_key=DASHSCOPE_KEY)

# Batch embedding with retry logic
BATCH_SIZE = 25  # Smaller batches to reduce timeout risk
MAX_RETRIES = 3
all_vectors = []
total_batches = (len(all_texts) - 1) // BATCH_SIZE + 1

for i in range(0, len(all_texts), BATCH_SIZE):
    batch = all_texts[i : i + BATCH_SIZE]
    batch_num = i // BATCH_SIZE + 1
    
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"    [*] Embedding batch {batch_num}/{total_batches} (attempt {attempt})...")
            vectors = embeddings_model.embed_documents(batch)
            all_vectors.extend(vectors)
            break  # Success
        except Exception as e:
            print(f"    [!] Batch {batch_num} failed (attempt {attempt}): {type(e).__name__}")
            if attempt == MAX_RETRIES:
                print(f"    [FATAL] Failed after {MAX_RETRIES} retries. Aborting.")
                raise
            import time as _t
            _t.sleep(3)  # Wait before retry
    
    import time as _t
    _t.sleep(1)  # Rate limit protection

# Merge vectors into final_data
for item, vector in zip(final_data, all_vectors):
    item["vector"] = vector

print(f"    [OK] Successfully generated {len(all_vectors)} vectors.")


# 4. Ingestion to Zilliz Cloud
print(f"\n[4/4] Syncing to Zilliz Cloud via MilvusClient...")

# Initialize Client
client = MilvusClient(uri=ZILLIZ_URI, token=ZILLIZ_TOKEN)

# Drop old collection
if client.has_collection(COLLECTION_NAME):
    print(f"    [*] Dropping old collection: {COLLECTION_NAME}")
    client.drop_collection(COLLECTION_NAME)

# Create new collection with explicit schema
print(f"    [*] Creating collection: {COLLECTION_NAME}")

schema = MilvusClient.create_schema(auto_id=True, enable_dynamic_field=True)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=1536)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)

# Prepare index params (required for Zilliz Cloud)
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", metric_type="COSINE", index_type="AUTOINDEX")

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params,
)

# Insert data in batches
print(f"    [*] Inserting {len(final_data)} chunks...")
BATCH = 100
for i in range(0, len(final_data), BATCH):
    batch = final_data[i:i+BATCH]
    client.insert(collection_name=COLLECTION_NAME, data=batch)
    print(f"    [*] Inserted batch {i//BATCH+1}/{(len(final_data)-1)//BATCH+1}")


print("\n" + "=" * 60)
print(f"  [DONE] Ingestion Complete!")
print(f"  Total chunks: {len(final_data)}")
print(f"  Collection: {COLLECTION_NAME} @ Zilliz Cloud")
print("=" * 60 + "\n")
