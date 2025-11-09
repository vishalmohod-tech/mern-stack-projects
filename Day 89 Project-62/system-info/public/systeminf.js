async function loadSystemInfo() {
  const res = await fetch("/api/system-info");
  const data = await res.json();

  document.getElementById("platform").textContent = data.platform;
  document.getElementById("arch").textContent = data.arch;
  document.getElementById("cpuModel").textContent = data.cpuModel;
  document.getElementById("cpuCores").textContent = data.cpuCores;
  document.getElementById("totalMem").textContent = data.totalMem;
  document.getElementById("freeMem").textContent = data.freeMem;
  document.getElementById("uptime").textContent = data.uptime;
  document.getElementById("homeDir").textContent = data.homeDir;
  document.getElementById("hostname").textContent = data.hostname;
}

document.getElementById("refreshBtn").addEventListener("click", loadSystemInfo);

loadSystemInfo();
