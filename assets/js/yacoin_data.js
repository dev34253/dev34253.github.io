

class YacoinDataAccess {
    constructor() {
        this.client = stitch.Stitch.initializeDefaultAppClient('yacoinapp-iwlqx');
        this.db = this.client.getServiceClient(stitch.RemoteMongoClient.factory, 'yacoinservice').db('yacoindb');
        this.client.auth.loginWithCredential(new stitch.AnonymousCredential())
            .then(user => this.refresh())
            .catch(err => {
                console.error(err)
            });
    }

    drawPlotly(timestamps, networkhashdata, blocktimedata) {
        let data = [{
            x: timestamps,
            y: networkhashdata
        }];
        let layoutHash = {            
            height: 400,
            xaxis: {
                tickangle: 45
            },
            yaxis: {
                range: [0, Math.max(...networkhashdata)]
            }
        };
        Plotly.plot(document.getElementById('chartNetworkHashPower'), data, layoutHash, {displayModeBar: false});
        
        let dataTime = [{
            x: timestamps,
            y: blocktimedata
        }]
        
        let layoutTime = {            
            height: 400,
            xaxis: {                
                tickangle: 45
            },
            yaxis: {
                range: [0, Math.max(...blocktimedata)]
            }
        };
        Plotly.plot(document.getElementById('chartTimeSinceBlock'), dataTime, layoutTime, {displayModeBar: false});
    }

    refresh() {
        this.db.collection("networkstats")
            .find({}, { limit: 2880, sort: { "time": 1 } })
            .asArray()
            .then((docs) => {
                console.log("got data");
                let timestamps = [];
                let hashdatapoints = [];
                let blocktimedatapoints = [];
                for (let i = 0; i < docs.length; i++) {
                    let doc = docs[i];
                    timestamps.push(new Date(doc.time).toLocaleString());                    
                    hashdatapoints.push(doc.networkHashPower);
                    blocktimedatapoints.push(doc.timeSinceLastBlock / 60);
                }
                this.drawPlotly(timestamps, hashdatapoints, blocktimedatapoints);
            });
    }

}
