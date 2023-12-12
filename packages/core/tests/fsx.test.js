/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { describe, it, beforeEach } from "node:test";
import { Fsx, NoSuchMethodError, ImplAreadySetError } from "../src/fsx.js";
import assert from "node:assert";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Strips the timestamp from a log entry.
 * @param {LogEntry} logEntry The log entry to strip.
 * @returns {object} The log entry without the timestamp.
 */
function stripTimestamp({ timestamp, ...rest }) {
    return rest;
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Fsx", () => {

    describe("Missing Methods", () => {
    
        [
            "text",
            "json",
            "arrayBuffer",
        ].forEach(methodName => {
            
            it(`should throw an error when the ${methodName}() method is not present on the impl`, () => {
                const fsx = new Fsx({ impl: {} });
    
                assert.rejects(fsx[methodName]("/path/to/file.txt"), new NoSuchMethodError(methodName));
            });
        });
    
    });

    describe("Changing impl", () => {
        
        it("should change the impl when setImpl() is called", async () => {
            const fsx = new Fsx({ impl: {} });
            const impl1 = {
                text() {
                    return "Hello, world!";
                }
            };

            fsx.setImpl(impl1);

            const result = await fsx.text("/path/to/file.txt");
            assert.strictEqual(result, "Hello, world!");
        });

        it("should change the impl back when resetImpl() is called", async () => {
            const fsx = new Fsx({ impl: {} });
            const impl1 = {
                text() {
                    return "Hello, world!";
                }
            };

            fsx.setImpl(impl1);

            const result = await fsx.text("/path/to/file.txt");
            assert.strictEqual(result, "Hello, world!");

            fsx.resetImpl();

            assert.rejects(fsx.text("/path/to/file.txt"), new NoSuchMethodError("text"));
        });

        it("should throw an error when setImpl() is called twice", async () => {
            const fsx = new Fsx({ impl: {} });
            fsx.setImpl({});

            assert.throws(() => {
                fsx.setImpl({});
            }, new ImplAreadySetError());
        });

        it("should return true for isBaseImpl() when the base impl is in use", () => {
            const fsx = new Fsx({ impl: {} });
            assert.strictEqual(fsx.isBaseImpl(), true);
        });

        it("should return true for isBaseImpl() when the impl is reset", () => {
            const fsx = new Fsx({ impl: {} });
            const impl1 = {
                text() {
                    return "Hello, world!";
                }
            };

            fsx.setImpl(impl1);
            assert.strictEqual(fsx.isBaseImpl(), false);

            fsx.resetImpl();
            assert.strictEqual(fsx.isBaseImpl(), true);
        });
    });


    describe("logStart() and logEnd()", () => {

        it("should start a new log and add an entry", () => {
            const fsx = new Fsx({
                impl: {
                    text() {
                        return "Hello, world!";
                    }
                }
            });

            fsx.logStart("test");
            fsx.text("/path/to/file.txt");
            const logs = fsx.logEnd("test").map(stripTimestamp);
            assert.deepStrictEqual(logs, [
                {
                    methodName: "text",
                    args: ["/path/to/file.txt"]
                }
            ]);
        });

        it("should start two new logs and add an entry to both", () => {
            const fsx = new Fsx({
                impl: {
                    text() {
                        return "Hello, world!";
                    }
                }
            });

            fsx.logStart("test1");
            fsx.logStart("test2");
            fsx.text("/path/to/file.txt");
            const logs1 = fsx.logEnd("test1").map(stripTimestamp);
            const logs2 = fsx.logEnd("test2").map(stripTimestamp);

            assert.deepStrictEqual(logs1, [
                {
                    methodName: "text",
                    args: ["/path/to/file.txt"]
                }
            ]);
            assert.deepStrictEqual(logs2, [
                {
                    methodName: "text",
                    args: ["/path/to/file.txt"]
                }
            ]);
        });

    });


});
