const Promise = require('bluebird');

module.exports = (shepherd) => {
  shepherd.get('/electrum/getblockinfo', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      shepherd.electrumGetBlockInfo(req.query.height, req.query.network)
      .then((json) => {
        const successObj = {
          msg: 'success',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.electrumGetBlockInfo = (height, network) => {
    return new Promise((resolve, reject) => {
      const ecl = shepherd.ecl(network);

      ecl.connect();
      ecl.blockchainBlockGetHeader(height)
      .then((json) => {
        ecl.close();
        shepherd.log('electrum getblockinfo ==>', true);
        shepherd.log(json, true);

        resolve(json);
      });
    });
  }

  shepherd.get('/electrum/getcurrentblock', (req, res, next) => {
    if (shepherd.checkToken(req.query.token)) {
      shepherd.electrumGetCurrentBlock(req.query.network)
      .then((json) => {
        const successObj = {
          msg: 'success',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      });
    } else {
      const errorObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(errorObj));
    }
  });

  shepherd.electrumGetCurrentBlock = (network) => {
    return new Promise((resolve, reject) => {
      const ecl = shepherd.ecl(network);

      ecl.connect();
      ecl.blockchainHeadersSubscribe()
      .then((json) => {
        ecl.close();

        shepherd.log('electrum currentblock (electrum >= v1.1) ==>', true);
        shepherd.log(json, true);

        if (json['block_height']) {
          resolve(json['block_height']);
        } else {
          resolve(json);
        }
      });
    });
  }

  return shepherd;
};