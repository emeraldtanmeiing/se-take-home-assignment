import { useState, useEffect, useRef, useReducer } from "react";
import { isEmpty } from "lodash";
import { useInterval } from "./useInterval.js";

const ACTIONS = {
  ADD_NEW_BOT: "new-bot",
  EDIT_BOT: "edit-bot",
  DELETE_LATEST_BOT: "delete-latest-bot",
};

function App() {
  const [orderNo, setOrderNo] = useState(1);
  const [pending, setPending] = useState([]);
  const [complete, setComplete] = useState([]);
  const nextOrder = useRef({});

  const [botNo, setBotNo] = useState(1);
  const [bots, dispatch] = useReducer(reducer, []);

  function sortOrders(orders) {
    orders.sort((a, b) => {
      return a.priority > b.priority
        ? 1
        : a.priority < b.priority
        ? -1
        : a.id > b.id
        ? 1
        : -1;
    });
  }

  function addOrder({ priority, order }) {
    let _order = order || { id: orderNo, priority: priority };
    setPending((prev) => {
      let temp = [...prev, _order];
      sortOrders(temp);
      return temp;
    });

    if (priority) {
      setOrderNo((prev) => prev + 1);
    }
  }

  useEffect(() => {
    nextOrder.current = pending[0];
  }, [pending]);

  function getNextOrder() {
    return nextOrder.current;
  }

  function completeOrder(order) {
    setComplete((prev) => [...prev, order]);
  }

  function reducer(bots, action) {
    switch (action.type) {
      case ACTIONS.ADD_NEW_BOT:
        setBotNo((prev) => prev + 1);
        return [...bots, { id: botNo, currentOrder: null }];

      case ACTIONS.EDIT_BOT:
        return bots.map((bot) => {
          if (bot.id === action.payload.bot.id) {
            return action.payload.bot;
          } else {
            return bot;
          }
        });

      case ACTIONS.DELETE_LATEST_BOT:
        setBotNo((prev) => prev - 1);
        let temp = [...bots];
        const latestBot = temp.pop();
        if (!isEmpty(latestBot.currentOrder)) {
          addOrder({ order: latestBot.currentOrder });
        }
        return temp;

      default:
        return bots;
    }
  }

  function assignOrder(bot, order) {
    setPending((prev) => [...prev].filter((i) => i.id !== order.id));
    bot.currentOrder = {
      ...order,
      timeLeft: 10,
    };
    dispatch({ type: ACTIONS.EDIT_BOT, payload: { bot } });
  }

  function addBot() {
    dispatch({ type: ACTIONS.ADD_NEW_BOT });
  }

  function removeLatestBot() {
    dispatch({ type: ACTIONS.DELETE_LATEST_BOT });
  }

  useInterval(() => {
    bots.forEach((bot) => {
      setTimeout(() => {
        //if bot has no order
        if (isEmpty(bot.currentOrder)) {
          if (!isEmpty(getNextOrder())) {
            const order = getNextOrder();
            assignOrder(bot, order);
          }
        } else {
          //if bot has order
          if (bot.currentOrder.timeLeft > 0) {
            bot.currentOrder.timeLeft = bot.currentOrder.timeLeft - 1;
            dispatch({ type: ACTIONS.EDIT_BOT, payload: { bot } });
          } else {
            const completedOrder = bot.currentOrder;
            completeOrder(completedOrder);
            bot.currentOrder = null;
            dispatch({ type: ACTIONS.EDIT_BOT, payload: { bot } });
          }
        }
      }, bot.id * 50);
    });
  }, 1000);

  return (
    <div>
      <button onClick={() => addOrder({ priority: 2 })}>
        New Normal Order
      </button>
      <br />
      <button onClick={() => addOrder({ priority: 1 })}>New VIP Order</button>
      <br />
      <br />

      <button onClick={() => addBot()}>+ Bot</button>
      <br />
      <button onClick={() => removeLatestBot()}>- Bot</button>
      <br />
      <br />

      <div className="pending">
        PENDING
        {pending.map((i) => {
          return (
            <div key={i.id}>
              Order {i.id} ({i.priority === 1 ? "VIP" : "Normal"})
            </div>
          );
        })}
      </div>

      <br />

      <div className="complete">
        COMPLETE
        {complete.map((i) => {
          return (
            <div key={i.id}>
              Order {i.id} ({i.priority === 1 ? "VIP" : "Normal"})
            </div>
          );
        })}
      </div>

      <br />

      <div className="bot">
        BOT
        {bots.map((i) => {
          return (
            <div key={i.id}>
              Bot {i.id}
              {", "}
              {i.currentOrder
                ? `Processing Order ${i.currentOrder.id}, ${i.currentOrder.timeLeft} seconds left...`
                : "Idle"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
