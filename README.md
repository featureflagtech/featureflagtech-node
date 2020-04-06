# featureflagtech-node

![CD Status](https://github.com/featureflagtech/featureflagtech-node/workflows/featureflag-node-workflow/badge.svg?branch=ci-development)

![Branch Status](https://github.com/featureflagtech/featureflagtech-node/workflows/featureflag-node-workflow/badge.svg?branch=ci-development)

Official NodeJS client for [featureflag.tech](https://featureflag.tech).

Features:

 * Stops you from littering your code with `if` statements.
 * Extremely light-weight ( < 60 lines of code, 1 dependency ).
 * Serverless runtime support (NodeJS 6.10 compliant, will work on AWS Lambda)

Awesome API means you don't use `if` statements in your code:

```
f2t.when( "newFeature" )
	.is( true, () => {
		// do the new stuff
	});
```

But will let you use `if` statements if you really want to:

```
if ( f2t.get( "newFeature" ) ) {
	// do some stuff
}
```

## Support

The official NodeJS client for featureflag.tech is compatible with NodeJS 6.10 and upwards.

Web browsers are not currently officially supported.

## Install

```
npm install featureflagtech-node --save
```

## Usage

```
const FeatureFlagTechClient = require( "featureflagtech-node" );

const f2t = new FeatureFlagTechClient({
  apiKey: "b6b3f5c8-c7ce-48c4-a1a2-0e0e43be626c"
});

f2t.getFlag().then( () => {

	f2t.when( "newFeature" )
		.is( true, () => {
			// do the new stuff
		})
		.is( false, () => {
			// do the old stuff
		})
		.else( () => {
			// do default stuff
		});

	if ( f2t.get( "newFeature" ) ) {
		// do some stuff
	}

}).catch( console.log );

if ( f2t.get( "newFeature" ) ) {
	// do some stuff
}

```

A great way to use feature flags is to use the values from your flag source but override them in specific contexts. For example with a web application, you can have a feature disabled by default in your live production, but then override the value using a cookie or parameter in the request.

For example:

```
const FeatureFlagTechClient = require( "featureflagtech-node" );

const f2t = 
	new FeatureFlagTechClient(
		{
			apiKey: "b6b3f5c8-c7ce-48c4-a1a2-0e0e43be626c"
		},
		{
			"falseBoolean": req.param( "falseBooleanOverride" ) || null
		}
	);

f2t.getSourceFile().then( () => {

	f2t.get( "falseBoolean" ) // returns true

});
```


## Develop

Check the project out:

```
git clone git@github.com:featureflagtech/node-client.git
```

Install deps:

```
npm install
```

Run the unit tests:

```
npm test
```