# cuneiform-cmpt

A wrapper for the save and render functions of a Cuneiform component. This is used for a set of NyMag components that display data from the `published-articles` index and which have **content descriptors**, which are properties that editors use to define what articles should populate them.

The `save` function automaticallys sets `cuneiformQuery`, `cuneiformPinned`, and `cuneiformScopes` based on the component's **content descriptors**.

The render function simply converts array content descriptors to and from a format compatible with Kiln.

## Usage

You can simply invoke either of these functions in the equivalent functions of the component that is using them:

```
module.exports.save = (ref, data, locals) => {
    cuneiformCmpt.save(ref, data, locals);
    // ...
    return data;
}
```

```
module.exports.render = (ref, data, locals) => {
    cuneiformCmpt.render(ref, data, locals);
    // ...
    return data;
});
```

## Content Descriptor Glossary

* `overrideUrl` - Force the article at the specified URL into the slot, regardless of the other content descriptors. (Sets `cuneiformPinned`).
* `dedupeContexts` - Prevents the same article from being duplicated between two or more cuneiform components. See below. (Sets `cuneiformScopes`).
* `botIgnore` - If set, the microservice will ignore this component entirely. (Sets `cuneiformIgnore`).

The following content descriptors are joined by OR relationships:

* `siteSlugs` - Match articles belonging to a site with ANY of these site slugs.
* `sitePrefixes` - Match articles with ANY of these URL prefixes (expects protocol and port).
* `crossposts` - Match articles crossposted to ANY of these sites, expressed via slug (e.g. `thecut`).

The following content descriptors are joined by AND relationships:

* `includeFeatureTypes` - Match articles with ANY of these feature types.
* `excludeFeatureTypes` - Exclude articles with ANY of these feature types.
* `includeTags` - Match articles with ANY of these tags.
* `excludeTags` - Exclude articles with ANY of these tags.
* `includeContentChannels` - Match articles with ANY of these content channels.
* `includeStoryCharacteristics` - Match articles with ALL of these story characteristics.
* `excludeStoryCharacteristics` - Exclude articles with ANY of these story characteristics.
* `includeFeeds` - Include articles set to appear in ALL of these feeds.
* `excludeFeeds` - Exclude articles set to appear in ANY of these feeds.

