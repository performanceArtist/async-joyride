# Async-joyride

This library is a wrapper over `react-joyride`, which provides basic tour components and adds an ability to wait for the step target to become available. This way you can place tour steps inside routes and loading components - the tour will switch to the step once it has been rendered.

The implementation is meant to be used with a particular development environment, but has an option to simply make tour global, without bindings to a particular component's lifecycle(`makeEagerTour`). But this still requires all peer deps to be installed:

```shell
npm install @performance-artist/async-joyride @performance-artist/fp-ts-adt @performance-artist/medium @performance-artist/react-utils @performance-artist/rx-utils fp-ts rxjs
```

## Example

You can see the example [here](https://github.com/performanceArtist/async-joyride-example).
