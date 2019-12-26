const get = require( "simple-get" );

const EmptyF2T = function() {}

EmptyF2T.prototype = {
	"is": function() { return this; },
	"else": function() {}
}

const F2T = function ( opts, localFeatureFlags ) {
	this._emptyF2T = new EmptyF2T();
	this.apiKey = opts.apiKey;
	this._features = localFeatureFlags || {};
	this._domain = opts._domain || "api.featureflag.tech";
};

F2T.prototype = {
	"_whenedFeature": null,
	"get": function ( feature ) {
		if ( feature in this._features ) {
			return this._features[ feature ];
		}
		return null;
	},
	"when": function ( feature ) {
		if ( feature in this._features ) {
			this._whenedFeature = this._features[ feature ];
		}
		return this;
	},
	"is": function ( value, callback ) {
		if ( this._whenedFeature == value ) {
			this._whenedFeature = null;
			callback();
			return this._emptyF2T;
		}
		return this;
	},
	"else": function ( callback ) {
		callback();
	},
	"getFlag": async function () {
		return new Promise( ( resolve, reject ) => {

			get.concat( {
				"url": `https://${this._domain}`,
				"json": true,
				"headers": {
					"fft-api-key": this.apiKey
				}
			}, ( err, res, data ) => {
				if ( err || ( res.statusCode != 200 ) ) {
					reject( err || new Error( "Source file not found" ) );
					return;
				}
				Object.keys( data ).forEach( ( key ) => {
					this._features[ key ] = ( key in this._features ) ? this._features[ key ] : data[ key ];
				});
				resolve();
			})

		});
	}
}

module.exports = F2T; 