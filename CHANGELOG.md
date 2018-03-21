## v3.4.0

* added support for raw regexp in router modules
* added support for hash navigation in lite-router
* added cache for parsed tagNames
* shortened vdom path syntax in build errors
* demoted orphaned component update to warning
* added error message when update address is invalid

## v3.3.1

* removed undocumented return value on `resetHistory` function

## v3.3.0

* update function blob now receives an identity as 5th argument
* view module's sync event now accepts an identity as 3rd argument
* made component update functions expire after component is replaced in the view
* removed undocumented special treatment of action types starting with `*`
* replaced undocumented `__RESET__` action with a `resetHistory` function on the api.

## v3.2.0

* build function blob now receives a queue as second argument
* separated the vdom diff/update from the resulting DOM changes
* made it safer to use the component's update function inside builder
* small performance improvements
* removed dist directory from npm file list

## v3.0.1

* added prepack to the build process for minified and gzipped bundles
* made all blob listeners in router use a queue

## v3.0.0

* made components capable of scoped layout updates, requires slight change of syntax
* merged use/emit into single bus
* added protection against overriding api with blobs
* fixed error when server kit received an element with undefined or null attributes
* added a catch-all path `**` to the routers
* made action, middleware and watcher blob handlers accept multiple arguments
* added html escaping for text elements in view.string

## v2.0.1

* added an alert when `view` is waiting to render
* forced direct kit requires
* removed pre/post-build blobs from `view`

## v2.0.0

* implemented keyed diffs in `view.dom`'s update function
* eliminated multiple packages in favor of internal modules
* added kits at the top level of the package
* moved api responsibilities into modules (from core)
* performance improvements by using for loops in critical paths
* added context to format errors in `view.build`

## v1.2.0

* added kits

## v1.1.1

* minor changes to typescript types

## v1.1.0

* added classname logic
* added typescript types

## v1.0.0

* renamed project from goo-js