# coding-night-live

[![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)](https://github.com/dduk-ddak/coding-night-live/blob/master/LICENSE) [![DOI](https://zenodo.org/badge/76672254.svg)](https://zenodo.org/badge/latestdoi/76672254) [![Build Status](https://travis-ci.org/dduk-ddak/coding-night-live.svg?branch=master)](https://travis-ci.org/dduk-ddak/coding-night-live)

**coding-night-live** is a Web-Based Communication Application for codelabs.

> Codelab is a fun step-by-step, seminar-based approach to developing a software together. 

Popular web-based applications like `Slack`, `PingPong`, etc., do exist for hosting interactive seminars, but none are customized exclusively for the codelabs. Coding-Night-Live is the light-weight, installation-free, web-based solution for the awesome codelab-thristy programmers!

* For more detailed information, [we have our Wiki](https://github.com/dduk-ddak/coding-night-live/wiki)!

## Overview

### [Youtube Introduction for coding-night-live v1.0](https://youtu.be/EgOmuShXVNE)

**3rd Place & Beyond FEST in [Naver](https://github.com/naver) [2016 D2 CAMPUS FEST](https://github.com/D2CAMPUS-FEST/2016)!**

![Overview](https://github.com/dduk-ddak/coding-night-live-doc/blob/master/images/0.%20Overview.gif)

## Features
* Markdown-based slides
* Live slide/code sharing
* Syntax highlighting for over 100 languages
* Track participants with live polling
* User-friendly Q&A through comments
* Catchy announcements with notice
* Join codelab via unique URL created for each event 
* Export codelab to pdf
* Collaborative code editing *(future)*

## Installation and Settings

#### Build Requirements

* `Python 3.5+`
* `Django 1.10+`
* `Redis 3+`
* `Docker` *(recommended)*

[Check requirements.txt](https://github.com/dduk-ddak/coding-night-live/blob/master/requirements.txt) for additional python packages

#### Installation

For further instructions on installation, [please visit our doc page.](https://github.com/dduk-ddak/coding-night-live-doc)

## Third Party Libraries

Please check [NOTICE](https://github.com/dduk-ddak/coding-night-live/blob/master/NOTICE)

* [`django`](https://github.com/django/django) 1.10+
* [`django-allauth`](https://github.com/pennersr/django-allauth)
* [`django-redis`](https://github.com/niwinz/django-redis)
* [`python-social-auth`](https://github.com/omab/python-social-auth)
* [`bootstrap`](https://github.com/twbs/bootstrap)
* [`CodeMirror`](https://github.com/codemirror/CodeMirror)
* [`jquery`](https://github.com/jquery/jquery)
* [`highlight.js`](https://github.com/isagalaev/highlight.js)
* [`markdown-it`](https://github.com/markdown-it/markdown-it)
* [`redis`](https://github.com/antirez/redis)
* [`simplemde-markdown-editor`](https://github.com/NextStepWebs/simplemde-markdown-editor)
* [`jquery-ui`](https://github.com/jquery/jquery-ui)
* [`Font-Awesome`](https://github.com/FortAwesome/Font-Awesome)
* [`google-diff-match-patch`](https://code.google.com/p/google-diff-match-patch/)
* [`reconnecting-websocket`](https://github.com/joewalnes/reconnecting-websocket)
* [`tether`](https://github.com/HubSpot/tether/)
* [`google-chart`](https://github.com/GoogleWebComponents/google-chart)
* [`github-markdown-css`](https://github.com/sindresorhus/github-markdown-css)
* [`clipboard.js`](https://clipboardjs.com/)
* [`raven`](https://github.com/getsentry/raven-python/)
* [`twisted`](https://github.com/twisted/twisted/)

## Documentation

We have a [coding-night-live-doc](https://github.com/dduk-ddak/coding-night-live-doc) page for project introduction, installation guide, and some documentation.

We welcome any documentation contribution.

## Bug Report & Contribution

We welcome any and all suggestions. Please follow our [guideline](https://github.com/dduk-ddak/coding-night-live/wiki/5.-Contributing-guide) when contributing to our project.

If you find a bug, please report it to us using the [Issues](https://github.com/dduk-ddak/coding-night-live/issues) page on GitHub, with appropriate labels(`bug`, ..)!

And we're also using error logging system with [`Sentry`](https://sentry.io/dduk-ddak/). so you don't need a capture page for every error log.

## License
coding-night-live is licensed under the MIT license.

```
The MIT License (MIT)

Copyright (c) 2017 fuzzythecat, juice500ml, punkyoon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

fuzzythecat
Younjoon Chung
fuzzy0427@gmail.com

juice500ml
Kwanghee Choi
juice500ml@gmail.com

punkyoon
Jiyoon Ha
punkkid001@gmail.com
```
