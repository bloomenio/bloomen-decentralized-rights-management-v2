require('dotenv').config();
const solr = require('solr-client');
const fs = require('fs');
const _DATA_PATH= './data/data.json';

var client = solr.createClient(process.env.SOLR_HOST, process.env.SOLR_PORT, process.env.SOLR_CORE, process.env.SOLR_PATH);
//client.basicAuth(process.env.SOLR_USER,process.env.SOLR_PASSWORD);

function _getData() {
    return JSON.parse(fs.readFileSync(_DATA_PATH, 'utf8'));
}

const data = _getData();
console.log(data);

client.add(data,(err,obj) => {
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

