
export interface UserData {
  id: number;
  login: string;
  avatar_url: string;
  location: string | null;
  url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos?: number;
}

interface GitHubSearchResponse {
  total_count: number;
  items: Pick<
    UserData,
    "id" | "login" | "avatar_url" | "url" | "html_url"
  >[];
}

export async function myCustomeFetcher<T>(
  url: string
): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error(
        "GitHub API rate limit reached. Please try again later."
      );
    }

    throw new Error(`GitHub API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchUserData(
  username: string,
  page = 1,
  perPage = 12
): Promise<{ users: UserData[]; total: number }> {
  const query = encodeURIComponent(username);

  const result = await myCustomeFetcher<GitHubSearchResponse>(
    `https://api.github.com/search/users?q=${query}&page=${page}&per_page=${perPage}`
  );

  const users = await Promise.all(
    result.items.map(async (item): Promise<UserData> => {
      try {
        const profile = await myCustomeFetcher<UserData>(
          `https://api.github.com/users/${encodeURIComponent(
            item.login
          )}`
        );

        return profile;
      } catch {
        // Agar individual profile request fail ho,
        // search result ki available information use karo.
        return {
          ...item,
          location: null,
          name: null,
          bio: null,
          public_repos: 0,
        };
      }
    })
  );

  return {
    users,
    total: Math.min(result.total_count, 1000),
  };
}
