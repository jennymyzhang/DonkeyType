import { Command, UndoManager } from "./undo";
import { createContext, useCallback, useState } from "react";

interface I18nWord {
  "en-CA": string;
  "fr-CA": string;
  [key: string]: string;
}

type Game = {
  id: number;
  text: I18nWord[];
  completed: boolean[];
  font: number;
  oldFont: number;
  focused: number;
  numWords: number;
  complete: number;
  clicked: boolean;
  undoManager: UndoManager;
};

type Games = {
  games: Game[];
  uniqueId: number;
  selectId: number | null;
  language: string;
  createGame: () => void;
  getGame: (id: number) => undefined | Game;
  setLanguage: (language: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  gameCount: () => number;
  getClicked: () => boolean;
  changeNumWords: (numWords: number) => void;
  updateFont: (id: number, font: number) => void;
  changeFont: (numWords: number) => void;
  select: (id: number) => void;
  deleteGame: (id: number | null) => void;
  clearGames: () => void;
  resetGame: () => void;
  processInput: (input: string) => boolean;
  changeFocus: (order: number) => void;
};

export const GameContext = createContext({} as Games);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [selectId, setSelectId] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>("english");

  const createGame = useCallback(async () => {
    if (games.length < 20) {
      const newText = await fetch2(20, uniqueId);
      setGames((prevGames) => [
        ...prevGames,
        {
          id: uniqueId, // Assume uniqueId is defined elsewhere
          completed: new Array(20).fill(false),
          text: newText,
          numWords: 20,
          font: 16,
          oldFont: 16,
          focused: 0,
          complete: 0,
          clicked: false,
          undoManager: new UndoManager(),
        },
      ]);
      setUniqueId(uniqueId + 1);
    }
  }, [games, uniqueId]);

  const getGame = useCallback(
    (id: number) => {
      return games.find((t) => t.id === id);
    },
    [games]
  );

  const undo = useCallback(() => {
    if (selectId !== null) {
      getGame(selectId)?.undoManager.undo();
    }
  }, [selectId]);

  const redo = useCallback(() => {
    if (selectId !== null) {
      getGame(selectId)?.undoManager.redo();
    }
  }, [selectId]);

  const canUndo = useCallback((): boolean => {
    if (selectId === null) return false;
    return getGame(selectId)?.undoManager.canUndo ?? false;
  }, [selectId]);

  const canRedo = useCallback((): boolean => {
    if (selectId === null) return false;
    return getGame(selectId)?.undoManager.canRedo ?? false;
  }, [selectId]);

  const gameCount = useCallback((): number => {
    return games.length;
  }, [games]);

  const getClicked = useCallback((): boolean => {
    if (selectId !== null) {
      const game = getGame(selectId);
      if (game) {
        return game.clicked;
      }
    }
    return false;
  }, [selectId, games]);

  const changeNumWords = useCallback(
    async (numWords: number) => {
      let newText: I18nWord[] = [];
      if (selectId !== null) {
        newText = await fetch2(numWords, selectId);
      }
      setGames((prevGames) => {
        return prevGames.map((game) => {
          if (selectId !== null && game.id === selectId) {
            if (numWords == game.numWords) {
              return game;
            }
            const oldState = {
              ...game,
              completed: [...game.completed],
              text: [...game.text],
            };
            game.numWords = numWords;
            game.complete = 0;
            game.focused = 0;
            game.clicked = false;
            game.text = newText;
            game.completed = new Array(numWords >= 0 ? numWords : 0).fill(
              false
            );

            const newState = {
              ...game,
              completed: [...game.completed],
              text: [...game.text],
            };
            game.undoManager.execute({
              do: () => {
                setGames((games) => {
                  return games.map((g) => {
                    if (g.id === selectId) {
                      return {
                        ...newState,
                        completed: [...newState.completed],
                        text: [...newState.text],
                      };
                    }
                    return g;
                  });
                });
              },
              undo: () => {
                setGames((games) => {
                  return games.map((g) => {
                    if (g.id === selectId) {
                      return {
                        ...oldState,
                        completed: [...oldState.completed],
                        text: [...oldState.text],
                      };
                    }
                    return g;
                  });
                });
              },
            } as Command);
          }
          return game;
        });
      });
    },
    [selectId, games]
  );

  const updateFont = useCallback(
    (id: number, font: number) => {
      setGames((prevGames) => {
        return prevGames.map((game) => {
          if (game.id === id) {
            game.font = font;
          }
          return game;
        });
      });
    },
    [games, selectId]
  );

  const changeFont = useCallback(
    (font: number) => {
      setGames((prevGames) => {
        return prevGames.map((game) => {
          if (selectId !== null && game.id === selectId) {
            const oldFont = game.oldFont;
            game.undoManager.execute({
              do: () => {
                setGames((games) => {
                  return games.map((g) => {
                    if (g.id === selectId) {
                      return { ...g, font: font, oldFont: font };
                    }
                    return g;
                  });
                });
              },
              undo: () => {
                setGames((games) => {
                  return games.map((g) => {
                    if (g.id === selectId) {
                      return { ...g, font: oldFont, oldFont: oldFont };
                    }
                    return g;
                  });
                });
              },
            } as Command);
            game.oldFont = font;
          }
          return game;
        });
      });
    },
    [selectId, games]
  );

  const select = useCallback((id: number) => {
    setSelectId((prevSelectId) => (prevSelectId === id ? null : id));
  }, []);

  const deleteGame = useCallback(
    (id: number | null) => {
      setGames((prevGames) => {
        if (prevGames.length === 0) {
          return prevGames;
        } else if (id === null) {
          if (selectId === prevGames[prevGames.length - 1].id)
            setSelectId(null);
          return prevGames.slice(0, prevGames.length - 1);
        } else {
          const newGames = prevGames.filter((t) => t.id !== id);
          if (selectId === id) setSelectId(null);
          return newGames;
        }
      });
    },
    [selectId, games]
  );

  const clearGames = useCallback(() => {
    setGames([]);
    setSelectId(null);
  }, []);

  const resetGame = useCallback(async () => {
    let newText: I18nWord[] = [];
    if (selectId !== null) {
      newText = await fetch2(getGame(selectId)?.numWords ?? 0, selectId);
    }

    setGames((prevGames) => {
      return prevGames.map((game) => {
        if (game.id === selectId) {
          const oldState = {
            ...game,
            completed: [...game.completed],
            text: [...game.text],
          };
          game.completed = new Array(game.numWords).fill(false);
          game.complete = 0;
          game.focused = 0;
          game.clicked = false;
          game.text = newText;
          const newState = {
            ...game,
            completed: [...game.completed],
            text: [...game.text],
          };

          game.undoManager.execute({
            do: () => {
              setGames((games) => {
                return games.map((g) => {
                  if (g.id === selectId) {
                    return {
                      ...newState,
                      completed: [...newState.completed],
                      text: [...newState.text],
                    };
                  }
                  return g;
                });
              });
            },
            undo: () => {
              setGames((games) => {
                return games.map((g) => {
                  if (g.id === selectId) {
                    return {
                      ...oldState,
                      completed: [...oldState.completed],
                      text: [...oldState.text],
                    };
                  }
                  return { ...g };
                });
              });
            },
          } as Command);
        }
        return game;
      });
    });
  }, [selectId, games]);

  async function fetch2(count: number, id: number) {
    try {
      if (count <= 0 || count > 9999) {
        return [];
      }
      const response = await fetch(`/myWordsApi/i18nwords?numWords=${count}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  }

  const processInput = useCallback(
    (input: string): boolean => {
      let result = false;
      setGames((prevGames) => {
        return prevGames.map((game) => {
          if (game.id === selectId) {
            const targetWord =
              game.text[game.focused][
                language === "english" ? "en-CA" : "fr-CA"
              ].toLowerCase();
            if (targetWord === input.toLowerCase()) {
              const oldState = {
                ...game,
                completed: [...game.completed],
                text: [...game.text],
              };

              game.completed[game.focused] = true;
              game.focused = game.completed.findIndex(
                (completed) => !completed
              );
              game.complete++;
              game.clicked = false;

              const newState = {
                ...game,
                completed: [...game.completed],
                text: [...game.text],
              };

              game.undoManager.execute({
                do: () => {
                  setGames((games) => {
                    return games.map((g) => {
                      if (g.id === selectId) {
                        return {
                          ...newState,
                          completed: [...newState.completed],
                          text: [...newState.text],
                        };
                      }
                      return g;
                    });
                  });
                },
                undo: () => {
                  setGames((games) => {
                    return games.map((g) => {
                      if (g.id === selectId) {
                        return {
                          ...oldState,
                          completed: [...oldState.completed],
                          text: [...oldState.text],
                        };
                      }
                      return g;
                    });
                  });
                },
              } as Command);
              result = true;
            }
          }
          return game;
        });
      });
      return result;
    },
    [selectId, language, games]
  );

  const changeFocus = useCallback(
    (order: number) => {
      setGames((prevGames) => {
        return prevGames.map((game) => {
          if (game.id === selectId) {
            const oldState = {
              ...game,
              completed: [...game.completed],
              text: [...game.text],
            };
            if (!game.clicked || (game.clicked && order !== game.focused)) {
              if (game.completed[order]) game.complete--;
              game.focused = order;
              game.completed[order] = false;
              game.clicked = true;
            } else if (game.clicked && order === game.focused) {
              game.focused = game.completed.findIndex(
                (completed) => !completed
              );
              game.clicked = false;
            }
            const newState = {
              ...game,
              completed: [...game.completed],
              text: [...game.text],
            };

            game.undoManager.execute({
              do: () => {
                setGames((games) => {
                  return games.map((g) => {
                    if (g.id === selectId) {
                      return {
                        ...newState,
                        completed: [...newState.completed],
                        text: [...newState.text],
                      };
                    }
                    return g;
                  });
                });
              },
              undo: () => {
                setGames((games) => {
                  return games.map((g) => {
                    if (g.id === selectId) {
                      return {
                        ...oldState,
                        completed: [...oldState.completed],
                        text: [...oldState.text],
                      };
                    }
                    return g;
                  });
                });
              },
            } as Command);
          }
          return game;
        });
      });
    },
    [selectId, games]
  );

  return (
    <GameContext.Provider
      value={{
        games,
        uniqueId,
        selectId,
        language,
        createGame,
        getGame,
        setLanguage,
        undo,
        redo,
        canUndo,
        canRedo,
        gameCount,
        getClicked,
        changeNumWords,
        updateFont,
        changeFont,
        select,
        deleteGame,
        clearGames,
        resetGame,
        processInput,
        changeFocus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
