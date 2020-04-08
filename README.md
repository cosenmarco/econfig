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
  safe in-production tests or practices like phased roll-outs, multi-variate testing
  and user targeting.

## Status of the project

The project is currently in its early infancy. There are some architectural decisions
taken and some parts are implemented to start exploring the problem space. It's not
yet usable though. What's missing:

- Clients
- Users / roles and authorization
- Authentication
- Secrets management
- Integration and security tests
- Scalability
- Most prospected integrations
- Zero downtime operation
- Docker container / Kubernetes recipes for a cluster
- Cluster synchronization strategies

## Architecture

![EconfigArchitecture](https://user-images.githubusercontent.com/807030/76566155-71864980-64ac-11ea-9ffb-d1b3b3675853.png)

### A few -ilities
In no particular order

* Auditable – The administrator should be able to extract information about
  which configuration was in effect at a certain time for every component / instance
  / user / session / request (given enough information is provided to fully resolve
  the dynamic part of the configuration).
* Fault tolerant / Offline capable – The component must have a stable configuration
  it can refer to as a starting point in case econfig server is unavailable
  or connectivity is lost. Network partitions must not cause a component to receive
  a configuration older than the one it already has.
* Highly available – The econfig server should be able to run in a highly
  available set up and be able scale horizontally
* Realtime – The configuration reach the components in a configurable latency
  (except in offline or slow network conditions)
* Transactional – Within a configuration change transaction, the changes should
  be adopted all at once or none. It should be trivial to rollback a config change.
* Flexible – Configuration should be arranged in a flexible way which is component
  independent. Multi-tenancy supported. Various databases / back-ends for the storage
  of configuration, audit logs, etc...
* Secure – Configuration should be only visible to designated owners, administrators
  and designated components.
* Integrated – Should be able to integrate with leading provides in the areas of
  authentication / authorization, secret management, databases, programming languages
  and frameworks
* Transparent – Offers well defined APIs both on the admin side and on
  the operation side. Integrates with metrics databases for realtime monitoring
  and reporting.

Non goals:
- Metrics and dashboards into econfig itself. There is a host of awesome open source
  providers for this. Econfig will try its best to provide integrations with most
  popular solutions.

### What can you do with it

* Continuous delivery
* Service discovery
* Feature flags
* Canary or blue / green deployments
* Multivariate tests
* Secret management
* Fine tuning

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

## Comparable alternatives

- [Optimizely](https://www.optimizely.com/)
- [LauchDarkly](https://launchdarkly.com/)
- [Rollout.io](https://rollout.io/)
- [ConfigCat](https://configcat.com/#home)
- [Unleash](https://unleash.github.io/)
- [Apptimize](https://apptimize.com/product/)
