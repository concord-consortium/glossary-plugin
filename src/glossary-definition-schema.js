// Generated using https://www.jsonschema.net/
// It can infer schema from the example. Then, it's easy to modify initial schema.

export default {
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/root.json",
  "type": "object",
  "title": "The Root Schema",
  "required": [
    "askForUserDefinition",
    "definitions"
  ],
  "properties": {
    "askForUserDefinition": {
      "$id": "#/properties/askForUserDefinition",
      "type": "boolean",
      "title": "The Askforuserdefinition Schema",
      "default": false,
      "examples": [
        true
      ]
    },
    "definitions": {
      "$id": "#/properties/definitions",
      "type": "array",
      "title": "The Definitions Schema",
      "items": {
        "$id": "#/properties/definitions/items",
        "type": "object",
        "title": "The Items Schema",
        "required": [
          "word",
          "definition"
        ],
        "properties": {
          "word": {
            "$id": "#/properties/definitions/items/properties/word",
            "type": "string",
            "title": "The Word Schema",
            "default": "",
            "examples": [
              "cloud"
            ],
            "pattern": "^(.*)$"
          },
          "definition": {
            "$id": "#/properties/definitions/items/properties/definition",
            "type": "string",
            "title": "The Definition Schema",
            "default": "",
            "examples": [
              "something blue"
            ],
            "pattern": "^(.*)$"
          },
          "image": {
            "$id": "#/properties/definitions/items/properties/image",
            "type": "string",
            "title": "The Image Schema",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "imageCaption": {
            "$id": "#/properties/definitions/items/properties/imageCaption",
            "type": "string",
            "title": "The Imagecaption Schema",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "video": {
            "$id": "#/properties/definitions/items/properties/video",
            "type": "string",
            "title": "The Video Schema",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "videoCaption": {
            "$id": "#/properties/definitions/items/properties/videoCaption",
            "type": "string",
            "title": "The Videocaption Schema",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          }
        }
      }
    }
  }
}
