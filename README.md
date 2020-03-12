# econfig
A world class solution for externalized configuration

## Architecture

![EconfigArchitecture](https://user-images.githubusercontent.com/807030/76566155-71864980-64ac-11ea-9ffb-d1b3b3675853.png)

### Design principles

- Easy and robust operation
- Easily scalable
- Extensible through use of well defined interfaces
- Simple, powerful abstractions at the core enabling great flexibility

# Core model

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

A `Tenant` encapsulates a set of software Components which
need to receive configuration and a set of settings about how
econfig operates in case a single econfig cluster is shared between
independent users of a large organization.

## Static vs dynamic dimensions

A static dimension is a `Dimension` which denotes `DimensionValue` which can be
resolved on the server side because all needed information is available there.

There are cases though (eg. a feature flag based on some properties in an incoming
REST call or based on some user claim) where it would be impractical to resolve the
configuration server side. By declaring the dimension "dynamic", the resolution will
have to be performed client side.
