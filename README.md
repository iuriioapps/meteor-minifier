Meteor Minifier
---------------

Meteor minifier with configurable Terser options.

Install in your app:

```
meteor add iuriioapps:meteor-minifier
```

To configure minifier, add .meteorminifierrc in the root of your application

```json
{
    "ignorePattern": "\.min\.js$",
    "terser": {
        "compress": {
            "drop_debugger": false,
            "unused": false,
            "dead_code": true,
            "comparisons": false
        },
        "safari10": true
    }
}
```

- If you specifying additional ignore patterns in `ignorePattern` make sure `.min.js` is still there.

If config is not specified, a default config will be used.
