const assert = require( "chai" ).assert;
const expect = require( "chai" ).expect;
const sinon  = require( "sinon" );
const get    = require( "simple-get" );

const F2T = require( "../index" );

let mockedGetConcat;

beforeEach(() => {
	mockedGetConcat = sinon.stub( get, "concat" );
});

afterEach(() => {
	mockedGetConcat.restore();
})

describe( "F2T", () => {

	describe( "Constructor method", () => {

    	it( "Sets properties required for API call", async () => {

			mockedGetConcat.yields(
				null,
				{
					"statusCode": 200
				},
				{
					"foo": true,
					"bar": true
				}
			);

			let fft = new F2T({
				apiKey: "123456"
			});

			await fft.getFlag();

			expect( mockedGetConcat.calledWith({
				url: "https://api.featureflag.tech",
				json: true,
				headers: {
					"fft-api-key": "123456"
				}
			}) ).to.be.true;

		});

		it( "Override feature flag values", () => {

			mockedGetConcat.yields(
				null,
				{
					"statusCode": 200
				},
				{
					"foo": true,
					"bar": true
				}
			);

			const f2t = new F2T(
				{},
				{
					"foo": false
				}
			);

			f2t.getFlag();

			expect( f2t.get( "foo" ) ).to.be.false;
			expect( f2t.get( "bar" ) ).to.be.true;

		});

		it( "Requesting flag values multiple times returns up to date changes to flag values", async () => {

			// Set value first
			// time
			mockedGetConcat.yields( null, { "statusCode": 200 }, {
				"foo": true
			} );

			const f2t = new F2T( {}, { "bar": true } );

			// Get value and assert 
			// first time
			await f2t.getFlag();
			expect( f2t.get( "foo" ) ).to.be.true;
			
			// Change the value, 
			// get value and assert 
			// second time
			mockedGetConcat.yields( null, { "statusCode": 200 }, {
				"foo": false
			} );
			await f2t.getFlag();
			expect( f2t.get( "foo" ) ).to.be.false;

		});

		it( "Requesting flag values multiple times does not write over override values", async () => {

			// Set value first
			// time
			mockedGetConcat.yields( null, { "statusCode": 200 }, {
				"bar": true
			} );

			const f2t = new F2T( {}, { "bar": true } );

			// Get value and assert 
			// first time
			await f2t.getFlag();
			expect( f2t.get( "bar" ) ).to.be.true;
			
			// Change the value, 
			// get value and assert 
			// second time
			mockedGetConcat.yields( null, { "statusCode": 200 }, {
				"bar": false
			} );
			await f2t.getFlag();
			expect( f2t.get( "bar" ) ).to.be.true;

		});

		it( "Should return a rejected promise if source file is 404", ( done ) => {

			mockedGetConcat.yields(
				new Error( "404: file not found" ),
				{
					"statusCode": 404
				},
				{}
			);

			const f2t = new F2T( "https://featureflag.tech/node/exampleflag.json" );

			f2t.getFlag()
				.then( () => {
					done( new Error( "Promise did not reject" ) );
				})
				.catch( ( err ) => {
					assert.isOk( true );
					done();
				});

		});

		it( "Should return a resolved promise if source file is 200", ( done ) => {

			mockedGetConcat.yields(
				null,
				{
					"statusCode": 200
				},
				{}
			);

			const f2t = new F2T( {} );

			f2t.getFlag()
				.then( () => {
					assert.isOk( true );
					done();
				})
				.catch( ( err ) => {
					done( new Error( "Promise rejected" ) );
				});

		});

	});

	it( "get() method", () => {

		const f2t = new F2T( {}, {
			"trueBoolean": true,
			"falseBoolean": false,
			"number": 33,
			"array": [ 1, 2 ],
			"object": { "foo": "bar" },
			"text": "laserwolf"
		});

		expect( f2t.get( "notDefined" )   ).to.equal( null );
		expect( f2t.get( "trueBoolean" )  ).to.equal( true );
		expect( f2t.get( "falseBoolean" ) ).to.equal( false );
		expect( f2t.get( "number" )       ).to.equal( 33 );
		expect( f2t.get( "array" )        ).to.deep.equal( [ 1, 2 ] );
		expect( f2t.get( "object" )       ).to.deep.equal( { "foo": "bar" } );
		expect( f2t.get( "text" )         ).to.equal( "laserwolf" );

	});

	it( "when() method", () => {

		const f2t = new F2T( {}, {
			"trueBoolean": true,
			"falseBoolean": false,
			"number": 33,
			"text": "laserwolf"
		});

		f2t.when( "notDefined" )
			//.is( f2t._anyValue, () => assert.fail() )
			.else( () => assert.isOk( true ) );

		f2t.when( "trueBoolean" )
			.is( true, () => assert.isOk( true ) )
			.is( false, () => assert.fail() )
			.else( () =>  () => assert.fail() );

		f2t.when( "falseBoolean" )
			.is( true, () => assert.fail() )
			.is( false, () => assert.isOk( true ) )
			.else( () =>  assert.fail() );

		f2t.when( "number" )
			.is( 33, () => assert.isOk( true ) )
			.else( () => assert.fail() );


		f2t.when( "text" )
			.is( "laserwolf", () => assert.isOk( true ) )
			.else( () => assert.fail() );

	});

});