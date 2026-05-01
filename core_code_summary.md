# CryptoRate 核心代码汇总 (标准控制器格式)

本文件按照标准控制器 (Controller) 格式整理了系统核心功能实现，涵盖后端接口逻辑、AI 算法模块及前端资产计算。

---

## 一、 后端核心控制器 (Java/Spring Boot)

### 1. 资产管理控制器 (`AssetController.java`)
**核心价值**：实现用户加密资产的增删改查及权限隔离。

```java
@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    /**
     * 查询当前用户的资产列表
     */
    @RequestMapping("/list")
    public R list(HttpServletRequest request) {
        // 从 Token 中获取当前登录用户 ID
        Long userId = (Long) request.getAttribute("userId");
        
        List<AssetDTO> list = assetService.getAssets(userId);
        return R.ok().put("data", list);
    }

    /**
     * 保存/更新资产记录
     */
    @RequestMapping("/save")
    public R save(@RequestBody UserAsset asset, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        
        // 绑定用户身份，防止越权提交
        UserAsset savedAsset = assetService.saveAsset(
            userId, asset.getSymbol(), asset.getAmount(), asset.getCost()
        );
        return R.ok("保存成功").put("data", savedAsset);
    }

    /**
     * 删除指定资产记录
     */
    @RequestMapping("/delete/{id}")
    public R delete(@PathVariable("id") Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        
        assetService.deleteAsset(id, userId);
        return R.ok("删除成功");
    }

    /**
     * 获取资产详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id) {
        UserAsset asset = assetService.selectById(id);
        return R.ok().put("data", asset);
    }
}
```

### 2. AI 智能分析控制器 (`AiController.java`)
**核心价值**：对接 Python AI 服务，提供市场智能预测功能。

```java
@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    /**
     * 提交市场分析问题
     */
    @RequestMapping("/query")
    public R query(@RequestBody Map<String, String> params) {
        String question = params.get("question");
        if (StringUtils.isBlank(question)) {
            return R.error("问题内容不能为空");
        }
        
        // 调用 AI 模块进行深度分析
        AiAskResponse result = aiService.ask(question);
        return R.ok("AI 分析成功").put("data", result);
    }
}
```

---

## 二、 Python AI 核心算法 (LangChain + RAG)

### 1. 知识库检索增强实现 (`rag_service.py`)
**核心价值**：基于向量数据库 (Milvus) 实现针对加密货币领域的专业 RAG 问答。

```python
class CryptoRAGService:
    def __init__(self):
        # 初始化 Embedding 模型
        self.embeddings = DashScopeEmbeddings(dashscope_api_key=API_KEY)
        
        # 连接向量数据库
        self.vectorstore = MilvusVectorStore(
            embedding_function=self.embeddings,
            connection_args={"uri": MILVUS_URI, "token": MILVUS_TOKEN},
            collection_name="crypto_knowledge"
        )
        
        # 构建 RAG 问答链
        llm = ChatTongyi(model="qwen-max", temperature=0.3)
        self.rag_chain = create_retrieval_chain(
            self.vectorstore.as_retriever(search_kwargs={"k": 3}),
            create_stuff_documents_chain(llm, PROMPT_TEMPLATE)
        )

    def ask(self, query: str):
        # 执行检索并生成专业回答
        return self.rag_chain.invoke({"input": query})
```

---

## 三、 React 前端核心逻辑 (Frontend)

### 1. 资产实时估值与 ROI 计算 (`Assets.jsx`)
**核心价值**：前端根据最新市场价动态计算投资回报。

```javascript
// 核心逻辑：遍历资产并注入实时行情
const processedAssets = assets.map(asset => {
    // 获取实时单价
    const rate = latestRates[asset.symbol] || 0;
    
    // 计算当前价值与盈亏
    const currentValue = rate * asset.amount;
    const profit = currentValue - asset.cost;
    const roi = asset.cost > 0 ? (profit / asset.cost) * 100 : 0;

    return { ...asset, currentValue, profit, roi, currentPrice: rate };
});

// 计算账户汇总数据
const totalValue = processedAssets.reduce((sum, a) => sum + a.currentValue, 0);
const totalProfit = totalValue - totalCost;
```

---

## 四、 核心表结构设计 (SQL)

```sql
-- 资产持仓表
CREATE TABLE `user_asset` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '所属用户',
  `symbol` varchar(20) NOT NULL COMMENT '币种代号',
  `amount` decimal(24,8) NOT NULL COMMENT '持有数量',
  `cost` decimal(24,8) NOT NULL COMMENT '持仓总成本(USD)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='用户加密资产持仓表';
```
