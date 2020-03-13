# econfig
A world class solution for externalized configuration

Externalized dynamic configuration capability provides numerous advantages including:

* Build once, run everywhere – The built component is agnostic about in which
  environment it will run. At startup it identifies itself and receives its configuration
* Better security – Secrets are known only in the final deployment environment and
  not shared in source or require complex encryption strategies.
* Fine tuning – Adapt the component to the condition of the environment it's working
  in (eg. timeouts, queues length, throttling etc...)
* Flexibility – Turn features on or off for specific set-ups or at specific point
  in time effectively decoupling feature releases from code releases and allowing
  safe in-production tests or things like phased roll-outs.

## Architecture

![EconfigArchitecture](https://user-images.githubusercontent.com/807030/76566155-71864980-64ac-11ea-9ffb-d1b3b3675853.png)

### A few -ilities
In no particular order

* Auditable– The administrator should be able to extract information about
  which configuration was in effect at a certain time for every component.
* Fault tolerant / Offline capable – The component must have a stable configuration
  it can refer to as a starting point in case econfig server is unavailable
  or connectivity is lost
* Highly available – The econfig server should be able to run in a highly
  available set up and be able scale horizontally
* Realtime – The configuration propagation should in 95% of the cases reach the
  components in 10 second and in 99% in 30 seconds (except in offline or slow network conditions)
* Transactional – Within a configuration change transaction, the changes should
  be adopted all at once or none. It should be trivial to rollback a config change.
* Flexible – Configuration should be arranged in a flexible way which is component
  independent.
* Secure – Configuration should be only visible to designated owners, administrators
  and designated components.
* Integrated – Should be able to integrate with leading provides in the areas of
  Authentication / Authorization, secret management, databases, programming languages
  and frameworks
* Databases / Back-Ends for the storage of configuration and audit logs
* Transparent – Offers well defined APIs both on the administrative side and on
  the operating side.

### What can you do with it

* Service discovery
* Feature flags
* Canary deployments
* Multivariate tests
* Secret management
* Blue / green deployments

## Core model

![EconfigDataModel](https://user-images.githubusercontent.com/807030/76566206-8fec4500-64ac-11ea-8bca-23852a99011a.png)

A configuration, from a user point of view, is in general modeled
as a dictionary of key / value entries.

Starting from lower level we have configuration `ConfigValue`s.
A `ConfigValue` has a list of `Dimension Value`s which restrict
the applicability of the configuration value contained in
the `ConfigValue`.

Each `ConfigValue` belongs to a `ConfigKey` (which is an identifier by which we
resolve the final configuration value on the client side) while each
`DimensionValue` belongs to a `Dimension` which defines how the `DimensionValue`s
have to be interpreted during config resolution.

Note that `ConfigValue`s and `DimensionValue`s are Value Objects whereas the
rest are Entities.

A `TenantModel` encapsulates a set of software `Component`s which
need to receive configuration and a set of settings (`EigenConfig`) about how
econfig operates in case an econfig cluster is shared between
independent users of a large organization.

### Static vs dynamic dimensions

A static dimension is a `Dimension` which denotes `DimensionValue` which can be
resolved on the server side because all needed information is available there.

There are cases though (eg. a feature flag based on some properties in an incoming
REST call or based on some user claim) where it would be impractical to resolve the
configuration server side. By declaring the dimension "dynamic", the resolution will
have to be performed client side.
