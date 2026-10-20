#!/usr/bin/env node
'use strict';

// Keep the previous command working with the current shared validation rules.
const { runCli } = require('./dataValidator');
if (require.main === module) runCli([...process.argv.slice(2), '--relationships-only']);
