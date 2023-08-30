#!/bin/bash
node dist/process.js $1 | sort -k1,1 -k3,3n 
