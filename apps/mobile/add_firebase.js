const xcode = require('xcode');
const fs = require('fs');

const projectPath = './ios/mobile.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parse(function (err) {
    if (err) {
        console.error('Error parsing project:', err);
        process.exit(1);
    }

    // Add the file to the project
    const file = myProj.addResourceFile('mobile/GoogleService-Info.plist');
    if (!file) {
        console.log('File is already in the project, or failed to add.');
    }

    // Add the file to the PBXGroup "mobile" so it shows up in Xcode's internal tree
    const pbxGroupKey = myProj.findPBXGroupKey({ name: 'mobile' });
    if (pbxGroupKey && file) {
        myProj.addToPbxGroup(file.fileRef, pbxGroupKey);
    }

    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Successfully updated project.pbxproj!');
});
