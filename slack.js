var https = require('https');
var querystring = require('querystring');
var objectMerge = require('object-merge');
var async = require('async');

var Slack = (function() {
    /**
     * Хост slack.com
     *
     * @memberof Slack
     * @type {String}
     */
    var slackHostname   = 'slack.com';
    /**
     * Путь до API slack
     *
     * @memberof Slack
     * @type {String}
     */
    var slackPath       = '/api/';

    /**
     * Класс запросов к Slack
     * 
     * @class  Slack
     * @param  {String} token - API токен
     */
    function slack(token) {
        this.token = token;
    }

    /**
     * Запрос бота на аутентификацию
     *
     * @memberof Slack
     * @param  {Slack~whoami-callback} callback - колбек ответа от auth
     */
    slack.prototype.whoami = function(callback) {
        /**
         * @callback Slack~whoami-callback
         * @param {string|null} error   - ошибка в коллбеке
         * @param {boolean} isLogged    - ответ коллбеку
         */

        var self = this;

        this.query('auth.test', {}, function(err, data) {
            if (!err && data.ok){
                self.user = data.user;
                self.team = data.team;

                self.team_id = data.team_id;
                self.user_id = data.user_id;

                callback( null, true );
            } else {
                callback( err, false );
            }
        });
    };

    /**
     * Запрос к методу slack
     *
     * @memberof Slack
     * @param  {sthing} method                      - метод slack. https://api.slack.com/methods
     * @param  {object} data                        - передаваемый POST объект
     * @param  {Slack~query-callback} callback      - коллбек ответа от API
     *
     * @see  https://api.slack.com/methods
     */
    slack.prototype.query = function(method, data, queryCallback) {
        /**
         * @callback Slack~query-callback
         * @param {string|null} error   - ошибка в коллбеке
         * @param {object} data         - ответ коллбеку
         */

        var self = this;

        var slackData = {};
            slackData.token = this.token;

        async.waterfall([
            // Запрос на аутентификацию
            function(callback) {
                if(method !== 'auth.test') {
                    if (self.user && !data.user) {
                        callback( null, true );
                    } else {
                        self.whoami( callback );
                    }
                } else {
                    callback( null, true );
                }
            },
            // Зарос к API
            function(isLogged, callback) {
                // Установка пользователя из WHOAMI, если в data нет пользователя
                if (!data.user) {
                    slackData.user      = self.user;
                    slackData.as_user   = true;
                }

                if(isLogged){
                    slackData = objectMerge(data, slackData);
                    var postData = querystring.stringify( slackData );

                    var options = {
                        hostname: slackHostname,
                        port: 443,
                        path: slackPath + method,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': postData.length
                        }
                    };

                    var req = https.request(options, function(res) {
                        var data = '';

                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            data += chunk;
                        });
                        res.on('end', function () {
                            try {
                                var objData = JSON.parse(data);
                                callback(null, objData);
                            } catch (e) {
                                callback('bad json', null);
                            }
                        });
                    });

                    req.write(postData);
                    req.end();
                } else {
                    callback('not logged', null);
                }
            }
        ], function (err, result) {
            queryCallback(err, result);
        });
    };

    return slack;

})();
module.exports = Slack;