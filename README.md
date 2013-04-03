PriceChecker
============

A simple price checker built with meteor and intended to be run only on a personal server.


Details
-------
Right now, the only required dependency is [cheerio](https://github.com/MatthewMueller/cheerio), which needs to be installed in the public folder:

    cd public
    npm install cheerio

I know this is hackey and a bad way to use modules, but I just wanted to get the repo up for backup purposes at the moment, and I'll fix it when possible (or when meteor fixes the package system to allow node modules natively).


Roadmap
-------
The  big features that are in the works are
- a bookmarklet for adding new items to the watch list, and
- CRON-like functionality for checking values on a schedule or at intervals.

I've create a cheap excuse for a roadmap at https://trello.com/b/lQthObKv.
