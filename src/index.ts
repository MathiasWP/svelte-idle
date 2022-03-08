import { onMount } from "svelte";
import { readable } from "svelte/store";
import type { Subscriber } from "svelte/store";

/**
 * Public stuff
 */
export let idle = readable(false, (set) => (update_store = set) && (() => set(false)));

export type StartOpts = {
    milliseconds?: number,
    throttle_milliseconds?: number
}

export function start(opts: StartOpts = {}) {
    if(!IS_BROWSER) return;

    if(typeof opts.milliseconds === 'number' && opts.milliseconds > 0) idle_timeout_ms = opts.milliseconds;
    if(typeof opts.throttle_milliseconds === 'number' && opts.throttle_milliseconds > 0) throttle_timeout_ms = opts.throttle_milliseconds;

    onMount(watch)
}

export function onIdle(cb: () => any) {
    if(!IS_BROWSER) return;

    if(!idle_callbacks.has(cb)) idle_callbacks.add(cb)
    return () => idle_callbacks.delete(cb)
}

/**
 * Private stuff
 */
const idle_callbacks: Set<() => any> = new Set()

let watchers = 0;
let is_throttling = false;
let update_store: Subscriber<boolean>;
let is_idle = false;
let idle_countdown: /* Timeout */ any;
let idle_timeout_ms = 1_000 * 60 * 10; // Default is 10 minutes
let throttle_timeout_ms = 200;

const IS_BROWSER = !!(window && document);
const INTERESTING_EVENTS = [
    "keypress",
    "keydown",
    "click",
    "contextmenu",
    "dblclick",
    "mousemove",
    "scroll",
    "touchmove",
    "touchstart"
]

function watch() {
    watchers++;
    if(watchers > 1) return;

    // keeping track of store value for easy access
    const unsubscribe = idle.subscribe(i => is_idle = i)

    start_countdown()

    for(const event of INTERESTING_EVENTS) {
        document.addEventListener(event, detect_action, { passive: true })
    }

    return () => {
        watchers--;

        if(watchers === 0) {
            for(const event of INTERESTING_EVENTS) {
                document.removeEventListener(event, detect_action)
            }
            clear_countdown()
            unsubscribe()
        }
    }
}

function start_countdown() {
    idle_countdown = setTimeout(() => {
        update_store(true)
        idle_callbacks.forEach(fn => fn())
    }, idle_timeout_ms);
}

function clear_countdown() {
    if(idle_countdown) clearTimeout(idle_countdown)
}

function start_throttle() {
    setTimeout(() => is_throttling = false, throttle_timeout_ms);
}

function detect_action() {
    if(is_throttling) return
    if(is_idle) update_store(false)

    is_throttling = true;

    clear_countdown()
    start_countdown()

    start_throttle()
}