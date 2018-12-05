

class YacoinDataAccess {
    constructor() {
        this.timestamps = [];
        this.networkhashdata = [];
        this.blocktimedata = [];
        this.moneysupplyData = [];
        this.difficultyData = [];

        this.client = stitch.Stitch.initializeDefaultAppClient('yacoinapp-iwlqx');
        this.db = this.client.getServiceClient(stitch.RemoteMongoClient.factory, 'yacoinservice').db('yacoindb');
        this.client.auth.loginWithCredential(new stitch.AnonymousCredential())
            .then(user => this.refresh())
            .catch(err => {
                console.error(err)
            });
    }

    drawChart(chartId, yseries, ymax=0){
        let data = [{
            x: this.timestamps,
            y: yseries
        }];
        
        let ts1 = this.timestamps[100];
        let ts2 = this.timestamps[Math.round(this.timestamps.length/2)];
        let ts3 = this.timestamps[this.timestamps.length-100];

        let layoutHash = {
            height: 400,
            xaxis: {
                tickvals: [ts1,ts2,ts3],
                ticktext: [ts1,ts2,ts3]
            },
            yaxis: {                
            }
        };
        if(ymax === 0){
            layoutHash.yaxis.rangemode = 'tozero';
        } else {
            layoutHash.yaxis.range = [0,ymax];
        }
        Plotly.react(chartId, data, layoutHash, { displayModeBar: false });
    }

    draw() {
        this.drawChart('chartNetworkHashPower', this.networkhashdata);
        this.drawChart('chartTimeSinceBlock', this.blocktimedata);        
        this.drawChart('chartMoneysupply', this.moneysupplyData);
        this.drawChart('chartDifficulty', this.difficultyData, 0.001);
    }

    refresh() {
        this.readData()
            .then(() => {
                this.draw();
            })
            .catch((err) => {
                console.log("ERROR data access");
            });
    }

    readData() {
        return new Promise((resolve, reject) => {
            this.db.collection("networkstats")
                .find({}, { limit: 2880, sort: { "time": -1 } }) // get descending to get latest value
                .asArray()
                .then((docs) => {
                    this.timestamps = [];
                    this.networkhashdata = [];
                    this.blocktimedata = [];
                    console.log("Entries: "+docs.length);
                    for (let i = 0; i < docs.length; i++) {
                        let doc = docs[docs.length-i-1]; // invert order
                        this.timestamps.push(new Date(doc.time).toLocaleString());
                        this.networkhashdata.push(doc.networkHashPower);
                        this.blocktimedata.push(doc.timeSinceLastBlock / 60);
                        if(doc.moneysupply){
                            this.moneysupplyData.push(doc.moneysupply);
                        } else {
                            this.moneysupplyData.push(0);
                        }
                        if(doc.difficulty){
                            this.difficultyData.push(doc.difficulty);
                        } else {
                            this.difficultyData.push(0);
                        }
                    }
                    resolve();
                })
                .catch((err) => {
                    console.log("ERROR getting data");
                    reject(err);
                });
        });
    }

}
