import { LinkItem } from "./LinkItem";

/**
 * defines ppplication links (urls)
 */
export const links : Array<LinkItem> = [ 
    new LinkItem('#/home',          'Home',     'page-home', true),   
    new LinkItem('#/signin',        'Sign-in',  'page-signin', false, false),    
] ;  