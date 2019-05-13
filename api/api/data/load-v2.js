require('dotenv').config();
const solr = require('solr-client');
const fs = require('fs');
const jsonPathLibrary = require('json-path-value');
const jsonPath = new jsonPathLibrary.JsonPath();


const _DATA_SR_PATH= './data/bloomen-music_metadata-sr-data.json';
const _DATA_MW_PATH= './data/bloomen-music_metadata-mw-data.json';

const client = solr.createClient(process.env.SOLR_HOST, process.env.SOLR_PORT, process.env.SOLR_CORE, process.env.SOLR_PATH);
//client.basicAuth(process.env.SOLR_USER,process.env.SOLR_PASSWORD);

let bloomenID = 0;

const srData =JSON.parse(fs.readFileSync(_DATA_SR_PATH, 'utf8'));

const mwData =JSON.parse(fs.readFileSync(_DATA_MW_PATH, 'utf8'));

function _testUnmarshall(doc){
    const pathValues = [];

    Object.keys(doc).forEach( property => {            
            const value = doc[property]+ '';

            if (property.endsWith('_s')) {
                pathValues.push(new jsonPathLibrary.JsonPathPair(property.substring(0,property.length-2), value, "string", ''));
            }
            else if (property.endsWith('_b')) {
                pathValues.push(new jsonPathLibrary.JsonPathPair(property.substring(0,property.length-2), value, "boolean", ''));
            }
            else if (property.endsWith('_i')) {
                pathValues.push(new jsonPathLibrary.JsonPathPair(property.substring(0,property.length-2), value, "number", ''));
            }
            else {
                pathValues.push(new jsonPathLibrary.JsonPathPair(property, value, "string", ''));
            }
            
        });
    
    const myObj=jsonPath.unMarshall(pathValues);
    console.log('koko',myObj);

}

function _solrFormat(data,type) {
    const documents = [];

    data.forEach(element => {    

            const marshalled = jsonPath.marshall(element,"",[]);        
            const document = {id: bloomenID++ +'', type_s: type};

            marshalled.forEach((item) => {
                switch(item.type){
                    case 'string':
                        document[item.path + '_s'] = item.value;
                    break;
                    case 'number':
                        document[item.path + '_i'] = parseInt(item.value);
                    break;
                    case 'boolean':
                         document[item.path + '_b'] = (item.value === 'true');
                    break;                    
                }

            });
            documents.push(document);  
           // console.log('marshalled:',document);
            
           // _testUnmarshall(document);
            
    });

    return documents;
}

const documentsSR = _solrFormat(srData, "Sound Recording");
const documentsMW = _solrFormat(mwData, "Musical Work");

client.add(documentsSR.concat(documentsMW),(err,obj) => {
   if(err){
      console.log(err);
   }else{
      console.log('Solr response:', obj);
      client.softCommit((err,res) => {
        if(err){
            console.log(err);
        }else{
            console.log(res);
            setTimeout(()=>console.log('bye bye'),3000);
        }
     });
   }
});

