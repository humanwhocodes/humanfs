# Logging

Logging is useful when you want to know what an `fsx` instance is doing but don't want to interfere with it. For example, you may want to verify that certain methods were called during a test but don't want to go through the trouble of setting up spies for each method.

## Enable Logging

To enable logging on an `fsx` instance, call the `logStart()` method and pass in a log name. When you're done logging, call `logEnd()` and pass in the same name to retrieve an array of log entries. Here's an example:

```js
fsx.logStart("test1");

const fileFound = await fsx.isFile("/path/to/file.txt");

const logs = fsx.logEnd("test1");
```

Each log entry is an object containing the following properties:

-   `timestamp` - the numeric timestamp of when the log was created
-   `type` - a string describing the type of log
-   `data` - additional data related to the log

For method calls, a log entry's `type` is `"call"` and the `data` property is an object containing:

-   `methodName` - the name of the method that was called
-   `args` - an array of arguments passed to the method.

For the previous example, `logs` would contain a single entry:

```js
// example log entry

{
    timestamp: 123456789,
    type: "call",
    data: {
        methodName: "isFile",
        args: ["/path/to/file.txt"]
    }
}
```

## Multiple Logs

You can have multiple logs collected by calling `logStart()` and passing in different log names. Each log is kept separate and contains its own log entries (as opposed to each log sharing the same objects). You can start and stop logs at any time. For example:

```js
fsx.logStart("test1");

const fileFound = await fsx.isFile("/path/to/file.txt");

fsx.logStart("test2");

const dirFound = await fsx.isDirectory("/path/to/dir");

const logs1 = fsx.logEnd("test1");
const logs2 = fsx.logEnd("test2");
```

Here, two logs are created: `"test1"` and `"test2"`. The `"test1"` log has two entries: one for the call to `isFile()` and one for the call to `isDirectory()`; the `"test2"` log has one entry for the `isDirectory()` call.

## Safety Features

In order to ensure the safety of logging, any attempt to call `startLog()` with a log name that is already active throws an error. This ensures that all logging stays unique to the caller and you can't accidentally overwrite an existing log.
