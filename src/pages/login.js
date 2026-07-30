import React from 'react'

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/Auth/login',
      permanent: false,
    },
  }
}

export default function LoginRedirect() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/Auth/login'
    }
  }, [])

  return (
    <div style={{ padding: 24 }}>
      Redirecting to <a href="/Auth/login">/Auth/login</a>...
    </div>
  )
}
