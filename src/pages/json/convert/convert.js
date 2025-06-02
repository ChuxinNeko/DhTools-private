const fs = require('fs');
const path = require('path');

// 读取GM.txt文件
const fileContent = fs.readFileSync('GM.txt', 'utf-8');

// 按行分割文件内容
const lines = fileContent.split('\n');

let currentCategory = null;
const categories = {};

// 解析文件内容
for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 检查是否是分类行
    if (trimmedLine.startsWith('#')) {
        currentCategory = trimmedLine.substring(1).trim();
        categories[currentCategory] = [];
    } 
    // 检查是否是ID行 (格式为 "数字: 名称")
    else if (currentCategory && trimmedLine.includes(':')) {
        const [id, name] = trimmedLine.split(':').map(part => part.trim());
        if (id && name && !isNaN(id)) {
            categories[currentCategory].push({
                label: name,
                value: parseInt(id)
            });
        }
    }
}

// 为每个分类创建JSON文件
for (const [category, items] of Object.entries(categories)) {
    if (items.length > 0) {
        const jsonContent = JSON.stringify(items, null, 2);
        const fileName = `${category}.json`;
        fs.writeFileSync(fileName, jsonContent);
        console.log(`已创建文件: ${fileName}`);
    }
}

console.log('转换完成！');