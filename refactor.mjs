import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const dirList = [
    '/Users/baburhussain/ChallanManagement-main/apps/backend/src',
    '/Users/baburhussain/ChallanManagement-main/apps/web/src',
    '/Users/baburhussain/ChallanManagement-main/packages/shared/src'
];

dirList.forEach(dir => {
    walkDir(dir, filePath => {
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
            let originalContent = fs.readFileSync(filePath, 'utf8');
            let newContent = originalContent;

            const replacements = [
                [/fabricQualityId/g, 'itemId'],
                [/FabricQualityId/g, 'ItemId'],
                [/qualityName/g, 'itemName'],
                [/QualityName/g, 'ItemName'],
                [/qualityCode/g, 'itemCode'],
                [/QualityCode/g, 'ItemCode'],
                [/useFabricQualities/g, 'useItems'],
                [/useCreateFabricQuality/g, 'useCreateItem'],
                [/useUpdateFabricQuality/g, 'useUpdateItem'],
                [/useDeleteFabricQuality/g, 'useDeleteItem'],
                [/useImportFabricQualities/g, 'useImportItems'],
                [/IFabricQuality/g, 'IItem'],
                [/createFabricQualitySchema/g, 'createItemSchema'],
                [/updateFabricQualitySchema/g, 'updateItemSchema'],
                [/fabricQualityFilterSchema/g, 'itemFilterSchema'],
                [/CreateFabricQualityInput/g, 'CreateItemInput'],
                [/UpdateFabricQualityInput/g, 'UpdateItemInput'],
                [/fabricQualityService/g, 'itemService'],
                [/FabricQualityService/g, 'ItemService'],
                [/FabricQualityListPage/g, 'ItemListPage'],
                [/FabricQualityModal/g, 'ItemModal'],
                [/FabricQuality/g, 'Item'],
                [/fabricQualities/g, 'items'],
                [/fabricQuality/g, 'item'],
                [/fabric-qualities/g, 'items'],
                [/fabric-quality/g, 'item'],
                [/fabric-master/g, 'items']
            ];

            for (let [pattern, replacement] of replacements) {
                newContent = newContent.replace(pattern, replacement);
            }

            if (originalContent !== newContent) {
                console.log(`Refactored: ${filePath}`);
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
        }
    });
});
console.log('Refactoring complete.');
