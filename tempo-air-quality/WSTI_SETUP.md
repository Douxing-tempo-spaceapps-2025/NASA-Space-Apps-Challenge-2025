# HCHO/NO2 热力图前端设置（替代 WSTI）

## 功能说明

当前实现：直接基于 Harmony 获取的 HCHO/NO2 点位，在地图上绘制双热力图层，覆盖美国全境。

## 新增组件

### 1. HeatmapLayers.tsx

- 显示 HCHO/NO2 热力图
- 两套配色与权重，区分两个产品
- 自动更新 source 数据

### 2. tempoHeatmapService.ts

- 调用后端 API 获取 HCHO/NO2 数据
- 处理数据格式和错误

## 使用方法

### 1. 启动后端服务

```bash
cd backend-fastapi
python run.py
```

### 2. 启动前端服务

```bash
cd tempo-air-quality
npm run dev
```

### 3. 访问应用

打开浏览器访问 `http://localhost:3000`

## 功能特性

### 热力图显示

- 基于 MapLibre heatmap 图层实现
- HCHO 与 NO2 使用不同色带

### 交互功能

- 点击标记查看详细威胁信息
- 实时数据刷新按钮
- 数据点数量显示
- 威胁等级图例

### 数据来源

- TEMPO L3 NRT 数据（Harmony 子集）
- 产品：HCHO、NO2
- 增量更新（新数据优先、旧数据补缺）

## 环境变量

在 `tempo-air-quality` 目录下创建 `.env.local` 文件：

```env
# API配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# MapTiler API密钥 (可选)
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
```

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **地图**: MapLibre GL JS
- **样式**: Tailwind CSS
- **后端**: FastAPI, Python
- **数据**: NASA TEMPO 卫星数据

## 注意事项

1. 确保后端服务正在运行
2. 确保 NASA Earthdata 认证配置正确
3. 首次加载可能需要几秒钟下载数据
4. 建议通过增量更新 API 定期刷新数据
