export const manifest = {
  screens: {
    scr_t76xut: { name: "Administrator Login", route: "/", position: { "x": 160, "y": 220 } },
    scr_pj4emq: { name: "Registration Dashboard", route: "/dashboard", position: { "x": 160, "y": 2200 } },
    scr_yh2qbv: { name: "Student Directory", route: "/students", position: { "x": 1560, "y": 2200 } },
    scr_q8e2s0: { name: "Programme Catalogue", route: "/programmes", position: { "x": 2960, "y": 2200 } },
    scr_2hcb6x: { name: "Import Student Data", route: "/import-students", position: { "x": 160, "y": 4180 } },
    scr_j1egcs: { name: "Validation Results", route: "/validation-results", position: { "x": 1560, "y": 4180 } },
    scr_044dfn: { name: "Registration Approval", route: "/approval", position: { "x": 2960, "y": 4180 } },
    scr_hls514: { name: "Account Creation", route: "/account-creation", position: { "x": 4360, "y": 4180 } },
    scr_k4xl8s: { name: "System Settings", route: "/settings", position: { "x": 160, "y": 6160 } }
  },
  sections: {
    sec_g2xjkl: { name: "Authentication", x: 0, y: 0, width: 1520, height: 1180 },
    sec_nvoeb9: { name: "Admin Dashboard", x: 0, y: 1980, width: 4320, height: 1180 },
    sec_x6qwjp: { name: "Data Import", x: 0, y: 3960, width: 5720, height: 1180 },
    sec_2w4j0v: { name: "System Configuration", x: 0, y: 5940, width: 1520, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_g2xjkl", children: [
    { kind: "screen", id: "scr_t76xut" }]
  },
  { kind: "section", id: "sec_nvoeb9", children: [
    { kind: "screen", id: "scr_pj4emq" },
    { kind: "screen", id: "scr_yh2qbv" },
    { kind: "screen", id: "scr_q8e2s0" }]
  },
  { kind: "section", id: "sec_x6qwjp", children: [
    { kind: "screen", id: "scr_2hcb6x" },
    { kind: "screen", id: "scr_j1egcs" },
    { kind: "screen", id: "scr_044dfn" },
    { kind: "screen", id: "scr_hls514" }]
  },
  { kind: "section", id: "sec_2w4j0v", children: [
    { kind: "screen", id: "scr_k4xl8s" }]
  }]

};