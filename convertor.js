const fs = require('fs');
const uuid = require('uuid');
const jfile = require('jsonfile');
const _ = require('lodash');
const inDir = process.env.IN_DIR || './csvs';
const outDir = process.env.OUT_DIR || './json';
const skillOrQual = process.env.SKILL_OR_QUAL || 'skill';

const files = _.pull(fs.readdirSync(inDir), '.gitkeep');

const converter = (fileLines, skillOrQual, fileName) => {
  let fullJson = {}
  if (skillOrQual === 'skill') {
    fullJson = {
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

  } else {
    fullJson = jfile.readFileSync('./qual.json');

    let qualificationTypeId = '';
    switch (fileName) {
      case (fileName.match(/certificate/i) || {}).input:
        qualificationTypeId = 'e3dcf8d1-7fe8-4764-844f-422d6846c8ed';
        break;
      case (fileName.match(/degree/i) || {}).input:
        qualificationTypeId = '37853f9c-c714-4d29-b0a8-d40194bf3f96';
        break;
      case (fileName.match(/diploma/i) || {}).input:
        qualificationTypeId = '419a6e06-36e2-4628-b678-0ee7a31a4d23';
        break;
      case (fileName.match(/professional/i) || {}).input:
        qualificationTypeId = '294a8bd4-c6c7-43a6-99cf-9b08dd7ce310';
        break;
    }
    const qualificationIndustryId = '8ca4a85b-9c14-4e0b-920e-9ea7defac4b1';

    fileLines.forEach((file) => {
      const name = file.split('\r')[0];
      fullJson.qualifications.push({
        name,
        id: uuid(),
        qualificationTypeId,
        qualificationIndustryId
      });
    });
  }

  return fullJson;
}

const doTheThing = files.forEach((fileName) => {
  const outFilename = `${fileName.split('.')[0]}.json`;
  const thatFile = fs.readFileSync(`${inDir}/${fileName}`, {encoding: 'utf8'});
  const processedFood = converter(thatFile.split('\n'), skillOrQual, fileName);
  jfile.writeFileSync(`${outDir}/${outFilename}`, processedFood, {spaces: 2});
});