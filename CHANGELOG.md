## v3.0.0

* made components capable of scoped layout updates, requires slight change of syntax
* merged use/emit into single bus
* added protection against overriding api with blobs
* fixed error when server kit received an element with undefined or null attributes
* added a catch-all path (**) to the routers

## v2.0.1

* added an alert when `view` is waiting to render
* forced direct kit requires
* removed pre/postbuild blobs from `view`

## v2.0.0

* implemented keyed diffs in `view.dom`'s udpate function
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