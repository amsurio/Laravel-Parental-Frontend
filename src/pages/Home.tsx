import { useEffect } from 'react';
import useAuthContext from '../hooks/useAuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import axios from '../lib/axios';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

export default function Home() {
  const { user, sendEmailVerificationLink, status, loading } = useAuthContext();

  // ===================================================================
  // websocket communication using Laravel Echo

  const echo = new Echo({
    broadcaster: 'pusher',
    key: '53bf81f321f9713df1ff',
    cluster: 'mt1',
    forceTLS: true
  });

  const sendData = async () => {
    try {
      await axios.post('/api/socket/child-data', {
        childId: 2,
        apps: 'Test App',
        sites: 'Test Site'
      });
    } catch (e) {
      console.warn('Error ', e);
    }
  };


  useEffect(() => {
    sendData();

    const parentId = 1;
    echo.channel(`parent.${parentId}`)
      .listen('ChildDataUpdated', (e: any) => {
        console.log(e);
      });

    window.Echo = echo;

  }, []);

  // ===================================================================




  useEffect(() => {
    if (status) {
      toast.success(status);
    }
  }, [status]);


  return (
    <>
      <h1 className="text-lg italic">
        Hello, <strong className="not-italic">{user?.name}</strong>!
      </h1>

      {!user?.email_verified_at && (
        <div className="my-10 p-4 bg-indigo-600 text-indigo-50 rounded-xl flex items-center gap-x-10">
          <p className="text-sm font-bold">Please verify your email address.</p>
          <button
            className="ring-1 ring-indigo-50 py-1.5 px-4 rounded-full hover:bg-white hover:text-indigo-600 text-lg flex items-center gap-x-2 disabled:cursor-not-allowed"
            onClick={sendEmailVerificationLink}
            disabled={loading}
          >
            {loading && <Spinner loading={loading} />}
            <span>Verify</span>
          </button>
        </div>
      )}
    </>
  );
}
