import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';

export function Menubar({
  designId,
  onLoad,
  onNew,
  onSave,
  onSaveAs
}: {
  designId?: string,
  onLoad: () => void,
  onNew: () => void,
  onSave: () => void,
  onSaveAs: () => void
}) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-row justify-between p-2 sticky top-0 z-10 bg-gray-950 border-b border-white/10">
      <div>
        <Button variant="ghost" onClick={onNew} className="cursor-pointer">
          New
        </Button>
        <Button variant="ghost" onClick={onLoad} disabled={!session} className="cursor-pointer">
          Load
        </Button>
        <Button variant="ghost" onClick={onSave} disabled={!session} className="cursor-pointer">
          Save
        </Button>
        <Button variant="ghost" onClick={onSaveAs} disabled={!session || !designId} className="cursor-pointer">
          Save As
        </Button>
      </div>
      <div>
        {session ? (
          <>
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="cursor-pointer"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => signIn('github')}
            className="cursor-pointer"
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
}
