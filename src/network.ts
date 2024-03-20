import Axios from 'axios';
import { Octokit } from 'octokit';

import { RAWCONTENTURL } from './constants.ts';

export const rawGHInstance = Axios.create({
    baseURL: RAWCONTENTURL,
});

export const octokit = new Octokit({
    userAgent: 'PluginsGallery',
    auth: process.env.TOKEN,
    log: console,
});
