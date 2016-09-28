const fs = require('fs');
const uuid = require('uuid');
const jfile = require('jsonfile');
const _ = require('lodash');
const inDir = process.env.IN_DIR || './csvs';
const outDir = process.env.OUT_DIR || './json';

const files = _.pull(fs.readdirSync(inDir), '.gitkeep');

const converter = (fileLines) => {
  const fullJson = {
    skillGroups: [],
    skillSets: [],
    skills: []
  };

  fileLines.forEach((line) => {
    const cleanLine = line.split('\r')[0];
    const splitLine = cleanLine.split(',');
    const skillGroupExists = _.find(fullJson.skillGroups, {name: splitLine[0]});

    if (skillGroupExists) {
      const skillGroupId = skillGroupExists.id;
      const skillSetExists = _.find(fullJson.skillSets, {name: splitLine[1]});

      if (skillSetExists) {
        const skillSetId = skillSetExists.id;

        fullJson.skills.push({
          name: splitLine[2],
          id: uuid(),
          skillSetId
        });
      } else {
        const skillSetId = uuid();

        fullJson.skillSets.push({
          name: splitLine[1],
          id: skillSetId,
          skillGroupId
        });
        fullJson.skills.push({
          name: splitLine[2],
          id: uuid(),
          skillSetId
        });
      }
    } else { //for a new skillGroup
      const skillGroupId = uuid();
      const skillSetId = uuid();

      fullJson.skillGroups.push({
        name: splitLine[0],
        id: skillGroupId
      });
      fullJson.skillSets.push({
        name: splitLine[1],
        id: skillSetId,
        skillGroupId
      });
      fullJson.skills.push({
        name: splitLine[2],
        id: uuid(),
        skillSetId
      });
    }
  });

  return fullJson;
}

const doTheThing = files.forEach((fileName) => {
  const outFilename = `${fileName.split('.')[0]}.json`;
  const thatFile = fs.readFileSync(`${inDir}/${fileName}`, {encoding: 'utf8'});
  const processedFood = converter(thatFile.split('\n'));
  jfile.writeFileSync(`${outDir}/${outFilename}`, processedFood, {spaces: 2});
});