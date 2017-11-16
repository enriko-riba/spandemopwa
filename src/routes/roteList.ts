import { LinkItem } from "./LinkItem";

/**
 * defines ppplication links (urls)
 */
export const list : Array<LinkItem> = [ 
    new LinkItem('#/home',          'Home',     'home', true),   
    new LinkItem('#/signin',        'Sign-in',  'signin', false, false),    
] ;  