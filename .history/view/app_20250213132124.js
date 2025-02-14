<!DOCTYPE html>
<html lang="en-us">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feed View</title>

  <!-- 直接在页面头部嵌入样式 -->
  <style>
    /* 下拉菜单的样式 */
    #apiFeeds {
      width: 200px;
      padding: 8px;
      font-size: 16px;
      margin: 10px;
      background-color: #f0f0f0;
      border-radius: 5px;
      border: 1px solid #ccc;
    }

    /* 基础表格样式 */
    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #f4f4f4;
    }

    /* 响应式设计：小屏幕下适应 */
    @media (max-width: 760px) {
      table, th, td {
        display: block;
        width: 100%;
      }
      td {
        border-bottom: 1px solid #ddd;
      }
    }
  </style>

</head>
<body>

  <!-- 下拉菜单，用于选择 feed -->
  <select id="apiFeeds" onchange="updateFeed(this.value)">
    <!-- 下拉菜单选项将在 JavaScript 中动态填充 -->
  </select>

  <div id="resultJson"></div>
  <div id="resultFull"></div>

  <!-- JavaScript 融入样式和功能 -->
  <script>
    // 定义所有的 API 选项
    const feeds = [
      { value: "none", name: "Select a feed..." },
      { value: "food", name: "USDA Food List" },
      { value: "usda", name: "USDA Nutrition Label" },
      { value: "farmfresh", name: "Farm Fresh (Michigan)" },
      { value: "nasa", name: "NASA Image Feed" },
      { value: "comtrade", name: "Comtrade (CORS)" },
      { value: "seeclickfix-311", name: "See Click Fix Requests" }
      // 更多 feed...
    ];

    // 动态填充下拉菜单
    function populateDropdown() {
      const selectElement = document.getElementById('apiFeeds');
      selectElement.innerHTML = '';  // 清空现有内容
      feeds.forEach(feed => {
        const option = document.createElement('option');
        option.value = feed.value;
        option.textContent = feed.name;
        selectElement.appendChild(option);
      });
    }

    // 当选择某个 feed 时，更新页面内容
    function updateFeed(feedValue) {
      console.log(`Selected feed: ${feedValue}`);

      // 根据 feedValue 进行相应的操作
      if (feedValue === 'food') {
        loadFoodData();
      } else if (feedValue === 'usda') {
        loadUSDAData();
      }
      // 更多条件处理...
    }

    // 示例：加载 USDA 食品数据
    function loadFoodData() {
      console.log("Loading USDA Food List...");
      // 假设从某个 API 获取数据并渲染
      document.getElementById('resultJson').innerHTML = '<p>USDA Food List API data displayed here.</p>';
    }

    // 示例：加载 USDA 营养标签数据
    function loadUSDAData() {
      console.log("Loading USDA Nutrition Data...");
      document.getElementById('resultJson').innerHTML = '<p>USDA Nutrition Data displayed here.</p>';
    }

    // 初始化页面
    populateDropdown();
  </script>

</body>
</html>