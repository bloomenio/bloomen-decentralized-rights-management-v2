/*
 * Extra typings definitions
 */

// // @ts-ignore
// declare var lastInboxLengthClaims = 0;

// Allow .json files imports
declare module '*.json';

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
