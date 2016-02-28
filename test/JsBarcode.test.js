var assert = require('assert');
var JsBarcode = require('../JsBarcode.js');
var Canvas = require("canvas");

var CODE39, CODE128, EAN, UPC, EAN8, ITF14, ITF, Pharmacode;
describe('Encoders', function() {
  it('should be able to include all encoders', function () {
    CODE39 = JsBarcode.getModule("CODE39");
    CODE128 = JsBarcode.getModule("CODE128");
    CODE128C = JsBarcode.getModule("CODE128C");
    EAN = JsBarcode.getModule("EAN");
    UPC = JsBarcode.getModule("UPC");
    EAN8 = JsBarcode.getModule("EAN8");
    ITF14 = JsBarcode.getModule("ITF14");
    ITF = JsBarcode.getModule("ITF");
    Pharmacode = JsBarcode.getModule("pharmacode");
  });
});

describe('node-canvas generation', function() {
  it('should generate normal canvas', function () {
    var canvas = new Canvas();
    JsBarcode(canvas, "Hello");
  });

  it('checking width', function () {
    var canvas1 = new Canvas();
    var canvas2 = new Canvas();

    JsBarcode(canvas1, "Hello", {format: "CODE128"});
    JsBarcode(canvas2, "Hello", {format: "CODE39"});

    assert.notEqual(canvas1.width, canvas2.width);
  });

  it('should throws errors when suppose to', function () {
    var canvas = new Canvas();
    assert.throws(function(){JsBarcode(canvas, "Hello", {format: "EAN8"});});
    assert.throws(function(){JsBarcode(canvas, "Hello", {format: "DOESNOTEXIST"});}, /Module DOESNOTEXIST does not exist/);
  });

  it('should create output with same input', function () {
    var canvas1 = new Canvas();
    var canvas2 = new Canvas();

    JsBarcode(canvas1, "Hello", {format: "CODE128"});
    JsBarcode(canvas2, "Hello", {format: "CODE128"});

    assert.equal(canvas1.toDataURL(), canvas2.toDataURL());
  });

  it('should set background color', function () {
    var canvas = new Canvas();
    var ctx = canvas.getContext("2d");
    JsBarcode(canvas, "Hello", {format: "CODE128", backgroundColor: "#f00"});

    var topLeft = ctx.getImageData(0,0,1,1);
    console.log(topLeft);
    assert.equal(topLeft.data[0], 255);
    assert.equal(topLeft.data[1], 0);
    assert.equal(topLeft.data[2], 0);
  });
});

describe('Text printing', function() {
  it('should produce different output when displaying value', function () {
    var canvas1 = new Canvas();
    var canvas2 = new Canvas();

    JsBarcode(canvas1, "Hello", {format: "CODE128", displayValue: true});
    JsBarcode(canvas2, "Hello", {format: "CODE128"});

    assert.notEqual(canvas1.toDataURL(), canvas2.toDataURL());
  });

  it('should produce different output when having different textAlign', function () {
    var canvas1 = new Canvas();
    var canvas2 = new Canvas();
    var canvas3 = new Canvas();

    JsBarcode(canvas1, "Hello", {format: "CODE128", displayValue: true, textAlign: "center"});
    JsBarcode(canvas2, "Hello", {format: "CODE128", displayValue: true, textAlign: "left"});
    JsBarcode(canvas3, "Hello", {format: "CODE128", displayValue: true, textAlign: "right"});

    assert.notEqual(canvas1.toDataURL(), canvas2.toDataURL());
    assert.notEqual(canvas2.toDataURL(), canvas3.toDataURL());
    assert.notEqual(canvas1.toDataURL(), canvas3.toDataURL());
  });
});

describe('CODE39', function() {
  it('should be able to encode normal text', function () {
    var enc = new CODE39("AB12*");
    assert.equal(enc.encoded(), "1000101110111010111010100010111010111010001011101110100010101110101110001010111001000101110111010");
  });

  it('should warn with invalid text', function () {
    var enc = new CODE39("AB!12");
    assert.equal(false, enc.valid());
  });

  it('should make lowercase to uppercase', function () {
    var enc = new CODE39("abc123ABC");
    assert.equal("ABC123ABC", enc.getText());
  });
});

describe('CODE128', function() {
  it('should be able to encode normal text', function () {
    var enc = new CODE128("a@B=1");
    assert.equal(enc.encoded(), "110100100001001011000011000110110100010110001110011001010011100110110111001001100011101011");
  });

  it('should encode CODE128C', function () {
    var enc = new CODE128C("12 34 56");;
    assert.equal("11010011100101100111001000101100011100010110100011011101100011101011", enc.encoded());
  });

  it('should warn with invalid text', function () {
    var enc = new CODE128("ABC" + String.fromCharCode(200));
    assert.equal(false, enc.valid());
  });
});

describe('UPC', function() {
  it('should be able to encode normal text', function () {
    var enc = new UPC("123456789999");
    assert.equal(enc.encoded(), "10100110010010011011110101000110110001010111101010100010010010001110100111010011101001110100101");
  });

  it('should warn with invalid text', function () {
    var enc = new UPC("12345");
    assert.equal(false, enc.valid());
  });

  it('should auto include the checksum if missing', function () {
    var enc = new UPC("12345678999");
    assert.equal("123456789999", enc.getText());
  });
});

describe('EAN', function() {
  it('should be able to encode normal text', function () {
    var enc = new EAN("5901234123457");
    assert.equal(true, enc.valid());
    assert.equal(enc.encoded(), "10100010110100111011001100100110111101001110101010110011011011001000010101110010011101000100101");
  });

  it('should warn with invalid text', function () {
    var enc = new EAN("12345");
    assert.equal(false, enc.valid());

    var enc = new EAN("5901234123456  ");
    assert.equal(false, enc.valid());
  });

  it('should auto include the checksum if missing', function () {
    var enc = new EAN("590123412345");
    assert.equal("5901234123457", enc.getText());
  });
});

describe('EAN-8', function() {
  it('should be able to encode normal text', function () {
    var enc = new EAN8("96385074");
    assert.equal(true, enc.valid());
    assert.equal(enc.encoded(), "1010001011010111101111010110111010101001110111001010001001011100101");
  });

  it('should auto include the checksum if missing', function () {
    var enc = new EAN8("9638507");

    assert.equal(true, enc.valid());
    assert.equal("96385074", enc.getText());
    assert.equal(enc.encoded(), "1010001011010111101111010110111010101001110111001010001001011100101");
  });

  it('should warn with invalid text', function () {
    var enc = new EAN8("12345");
    assert.equal(false, enc.valid());

    var enc = new EAN8("96385073");
    assert.equal(false, enc.valid());
  });
});

describe('ITF-14', function() {
  it('should be able to encode normal text', function () {
    var enc = new ITF14("98765432109213");
    assert.equal(enc.encoded(), "101010001110101110001010100010001110111011101011100010100011101110001010100011101010001000111010111000101110100011100010001010111011101");
  });

  it('should be able to add checksum if needed', function () {
    var enc = new ITF14("9876543210921");
    assert.equal(enc.encoded(), "101010001110101110001010100010001110111011101011100010100011101110001010100011101010001000111010111000101110100011100010001010111011101");
  });

  it('should warn with invalid text and not when valid', function () {
    var enc = new ITF14("987654321092");
    assert.equal(false, enc.valid());

    var enc = new ITF14("98765432109212");
    assert.equal(false, enc.valid());

    var enc = new ITF14("98765432109213");
    assert.equal(true, enc.valid());

    var enc = new ITF14("9876543210921");
    assert.equal(true, enc.valid());
  });
});

describe('ITF', function() {
  it('should be able to encode normal text', function () {
    var enc = new ITF("123456");
    assert.equal(enc.encoded(), "101011101000101011100011101110100010100011101000111000101011101");
  });

  it('should warn with invalid text', function () {
    var enc = new ITF("12345");
    assert.equal(false, enc.valid());

    var enc = new ITF("1234AB");
    assert.equal(false, enc.valid());
  });
});

describe('Pharmacode', function() {
  it('should be able to encode normal text', function () {
    var enc = new Pharmacode("1234");
    assert.equal(enc.encoded(), "10010011100111001001110010010011100111");
  });

  it('should warn with invalid text', function () {
    var enc = new Pharmacode("12345678");
    assert.equal(false, enc.valid());
  });
});