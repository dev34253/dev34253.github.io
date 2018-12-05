

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

    drawHash() {
        let data = [{
            x: this.timestamps,
            y: this.networkhashdata
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
                rangemode: 'tozero'
            }
        };
        Plotly.react('chartNetworkHashPower', data, layoutHash, { displayModeBar: false });
    }

    drawTime() {
        let dataTime = [{
            x: this.timestamps,
            y: this.blocktimedata
        }]

        let ts1 = this.timestamps[100];
        let ts2 = this.timestamps[Math.round(this.timestamps.length/2)];
        let ts3 = this.timestamps[this.timestamps.length-100];

        let layoutTime = {
            height: 400,
            xaxis: {
                tickvals: [ts1,ts2,ts3],
                ticktext: [ts1,ts2,ts3]
            },
            yaxis: {
                range: [0, Math.max(...this.blocktimedata)]
            }
        };
        Plotly.react('chartTimeSinceBlock', dataTime, layoutTime, { displayModeBar: false });
    }


    drawMoneysuply() {
        let dataTime = [{
            x: this.timestamps,
            y: this.moneysupplyData
        }]

        let ts1 = this.timestamps[100];
        let ts2 = this.timestamps[Math.round(this.timestamps.length/2)];
        let ts3 = this.timestamps[this.timestamps.length-100];

        let layoutTime = {
            height: 400,
            xaxis: {
                tickvals: [ts1,ts2,ts3],
                ticktext: [ts1,ts2,ts3]
            },
            yaxis: {
                range: [0, Math.max(...this.moneysupplyData)]
            }
        };
        Plotly.react('chartMoneysupply', dataTime, layoutTime, { displayModeBar: false });
    }

    drawDifficulty() {
        let dataTime = [{
            x: this.timestamps,
            y: this.difficultyData
        }]

        let ts1 = this.timestamps[100];
        let ts2 = this.timestamps[Math.round(this.timestamps.length/2)];
        let ts3 = this.timestamps[this.timestamps.length-100];

        let layoutTime = {
            height: 400,
            xaxis: {
                tickvals: [ts1,ts2,ts3],
                ticktext: [ts1,ts2,ts3]
            },
            yaxis: {
                range: [0, 0.001]
            }
        };
        Plotly.react('chartDifficulty', dataTime, layoutTime, { displayModeBar: false });
    }

    draw() {
        this.drawHash();
        this.drawTime();
        this.drawMoneysuply();
        this.drawDifficulty();
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
