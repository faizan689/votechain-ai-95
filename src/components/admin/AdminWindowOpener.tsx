
export const AdminWindowOpener = () => {
  const openInNewWindow = () => {
    console.log("Opening admin panel in new window");
    const width = 1200;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      `/admin?external=true&adminVerified=true`, 
      'AdminPanel', 
      `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0`
    );
  };

  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={openInNewWindow}
        className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-md flex items-center gap-2"
      >
        <span>Open in New Window</span>
      </button>
    </div>
  );
};
