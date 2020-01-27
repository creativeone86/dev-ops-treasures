var express = require('express');
var app = express();
var redis = require("redis");
const mariadb = require('mariadb');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

app.get('/', async function(req, res) {
    var client = redis.createClient({
        host: 'redis',
        port: '6379'
    });
    client.on("error", function (err) {
        res.send('Could not connect to redis');
    });
    client.on('connect', async function() {
        const result = (await client.keysAsync('row_*'))
            .map((entity) => parseInt(entity.match(/\d+/)[0]))
            .sort((a, b) => a - b);
        const searchByKeys = result.map((key) => `row_${key}`);
        const redisResult = (await client.mgetAsync(searchByKeys));
        const pool = mariadb.createPool({
            host: 'mariaDB',
            user: 'muzmatch',
            password: 'muzmatch',
            database: 'stringdb',
            connectionLimit: 5
        });
        let conn;
        try {
            conn = await pool.getConnection();
            const text = await redisResult.reduce(async (accumulator, currentitem) => {
                const asyncReducer = await accumulator;
                const row = await conn.query(`SELECT string FROM strings WHERE string_id = '${currentitem}';`);
                let rowText =  typeof row[0] !== 'undefined' && typeof row[0].string !== 'undefined' ? row[0].string : '';
                rowText = rowText.replace(/W/g, ".");
                return asyncReducer + rowText + '\n';
            }, Promise.resolve('\n\n\n............... This is freaking amazing!!! ................\n'));
            console.log(text)
        } catch (err) {
            console.log(err);
        } finally {
            if (conn) conn.release();
        }
        res.send(`We can rule the world!`);
    });
});

app.listen(3000);
