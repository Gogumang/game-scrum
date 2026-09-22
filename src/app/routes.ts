import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("r/:room", "routes/play.tsx"),
  route("r/:room/host", "routes/host.tsx"),

  route("dev/scenes", "routes/dev.scenes.tsx"),

  route("api/rooms", "routes/api.rooms.ts"),
  route("api/room/:room", "routes/api.state.ts"),
  route("api/room/:room/host", "routes/api.host.ts"),
  route("api/room/:room/join", "routes/api.join.ts"),
  route("api/room/:room/vote", "routes/api.vote.ts"),
  route("api/room/:room/control", "routes/api.control.ts"),
  route("api/room/:room/analyze", "routes/api.analyze.ts"),
] satisfies RouteConfig;
