# Design

## Goals

Create a high-level file system API that:

* Embraces modern JavaScript idioms.
* Works the same way across multiple backing stores.
* Is suitable for in-memory, local, and cloud storage solutions.

## Approach

The overall approach is to humanfs is to optimize for what developers do most of the time and in a way that translates across differenting backing stores. In particular:

* **Common cases should be easy.** Following the [80/20 principle](https://en.wikipedia.org/wiki/Pareto_principle), humanfs optimizes for the most common cases and doesn't worry about the edge cases.
* **Errors should be rare.** When performing common file system operations, errors should indicate a fatal state from which it's impossible to recover automatically.
* **No unnecessary objects.** For operations that work across many files, every object created is a performance penalty. humanfs creates as few objects as possible to get the job done.
* **Actions should be observable.** It's easy to tell when a method was called and with which arguments.
* **Mocking is easy.** You can easily swap out an implementation for another for testing or other purposes.

## Naming Conventions

Method names:

* Should consist of one or two words.
* Should not contain the word "file" unless absolutely necessary. (Most of the methods apply to files. Exception: `isFile()`.)
* Should not contain abbreviations. (Acronyms like URL are okay.)
* Should contain the word "directory" if they operate strictly on directories.
* Should contain the word "all" if they are operate on directories recursively. (Examples: `copyAll()`, `deleteAll()`.)

Variable and parameter names:

* May contain abbreviations.
* `filePath` is preferred for strings that are the location of a file.
* `dirPath` is preferred for strings that are the location of a directory.
* `fileOrDirPath` is preferred for strings that can be location either of a file or directory.

## Methods

Methods:

* Should not have optional parameters.
* Should not have options objects as a parameter.
